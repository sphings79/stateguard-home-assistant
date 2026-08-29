"""The monitoring engine that drives every problem's lifecycle."""

from __future__ import annotations

from datetime import timedelta
import json
import logging
import time
from typing import Any

from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.core import Event, EventStateChangedData, HomeAssistant, callback
from homeassistant.helpers import (
    area_registry as ar,
    device_registry as dr,
    entity_registry as er,
    label_registry as lr,
)
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import (
    async_track_state_change_event,
    async_track_time_interval,
)

from .conditions import ConditionResult, evaluate
from .const import (
    DOMAIN,
    EVENT_ALERT,
    EVENT_CLEARED,
    EVENT_ESCALATED,
    SCAN_INTERVAL_SECONDS,
    USER_SUPPRESSIONS,
    OverlapMode,
    ProblemStatus,
    SuppressionReason,
)
from .dispatcher import Dispatcher
from .history import History, IncidentRecord
from .models import Config, ProblemState, Watch
from .resolver import TargetResolver
from .store import StateGuardStore
from .suppression import SuppressionEngine

_LOGGER = logging.getLogger(__name__)

SIGNAL_UPDATED = f"{DOMAIN}_updated"


class StateGuardEngine:
    """Resolves targets, evaluates conditions and keeps problem state."""

    def __init__(self, hass: HomeAssistant, store: StateGuardStore) -> None:
        """Wire up the collaborators without touching Home Assistant yet."""
        self.hass = hass
        self.store = store
        self.resolver = TargetResolver(hass)
        self.suppression = SuppressionEngine(hass, time.time())
        self.dispatcher = Dispatcher(hass, self)
        self.history = History(hass)
        self.problems: dict[tuple[str, str], ProblemState] = {}
        self.resolved: dict[str, set[str]] = {}
        self._unsub: list[Any] = []
        self._unsub_states: Any = None
        self._state_dirty = False

    @property
    def config(self) -> Config:
        """Return the current configuration."""
        return self.store.config

    async def async_start(self) -> None:
        """Load state, resolve targets and begin monitoring."""
        await self.history.async_setup()
        removed = await self.history.async_purge(
            self.config.settings.history_retention_days
        )
        if removed:
            _LOGGER.debug("Purged %d incidents past the retention period", removed)
        self.problems = await self.store.async_load_problems()
        self.async_refresh_targets()

        for event_type in (
            er.EVENT_ENTITY_REGISTRY_UPDATED,
            dr.EVENT_DEVICE_REGISTRY_UPDATED,
            ar.EVENT_AREA_REGISTRY_UPDATED,
            lr.EVENT_LABEL_REGISTRY_UPDATED,
        ):
            self._unsub.append(
                self.hass.bus.async_listen(event_type, self._handle_registry_update)
            )

        self._unsub.append(
            async_track_time_interval(
                self.hass,
                self._handle_tick,
                timedelta(seconds=SCAN_INTERVAL_SECONDS),
            )
        )
        self._unsub.append(
            self.hass.bus.async_listen_once(
                EVENT_HOMEASSISTANT_STOP, self._handle_shutdown
            )
        )
        _LOGGER.debug(
            "Started with %d watch(es), %d entities under observation",
            len(self.config.watches),
            len(self.watched_entities),
        )

    async def async_stop(self) -> None:
        """Detach every listener and persist the current state."""
        for unsub in self._unsub:
            unsub()
        self._unsub.clear()
        if self._unsub_states is not None:
            self._unsub_states()
            self._unsub_states = None
        await self.store.async_save_problems(self.problems)

    @property
    def watched_entities(self) -> set[str]:
        """Return every entity id covered by at least one watch."""
        watched: set[str] = set()
        for entity_ids in self.resolved.values():
            watched |= entity_ids
        return watched

    @callback
    def async_refresh_targets(self) -> None:
        """Re-resolve every watch and re-arm the state listener."""
        self.resolved = {
            watch.id: self.resolver.resolve(watch.target)
            for watch in self.config.watches
        }
        self._prune_stale_problems()

        if self._unsub_states is not None:
            self._unsub_states()
            self._unsub_states = None

        watched = self.watched_entities
        if watched:
            self._unsub_states = async_track_state_change_event(
                self.hass, list(watched), self._handle_state_change
            )

    @callback
    def _prune_stale_problems(self) -> None:
        """Drop problems whose watch or entity is no longer in scope."""
        for key in list(self.problems):
            watch_id, entity_id = key
            if entity_id not in self.resolved.get(watch_id, set()):
                del self.problems[key]
                self._state_dirty = True

    async def async_config_changed(self) -> None:
        """Re-resolve after the configuration was edited."""
        self.async_refresh_targets()
        self.async_evaluate_all()
        async_dispatcher_send(self.hass, SIGNAL_UPDATED)

    @callback
    def _handle_registry_update(self, event: Event) -> None:
        """Re-resolve targets when a registry changed."""
        self.async_refresh_targets()
        async_dispatcher_send(self.hass, SIGNAL_UPDATED)

    @callback
    def _handle_state_change(self, event: Event[EventStateChangedData]) -> None:
        """Evaluate the single entity whose state just changed."""
        entity_id = event.data["entity_id"]
        changed = False
        for watch in self.config.watches:
            if entity_id in self.resolved.get(watch.id, set()):
                changed |= self._evaluate_pair(watch, entity_id)
        if changed:
            async_dispatcher_send(self.hass, SIGNAL_UPDATED)

    async def _handle_tick(self, now: Any) -> None:
        """Run the periodic pass for stale checks, grace and escalation."""
        changed = self.async_evaluate_all()
        if changed:
            async_dispatcher_send(self.hass, SIGNAL_UPDATED)
        if self._state_dirty:
            await self.store.async_save_problems(self.problems)
            self._state_dirty = False
        await self.dispatcher.async_tick()

    async def _handle_shutdown(self, event: Event) -> None:
        """Persist state when Home Assistant shuts down."""
        await self.store.async_save_problems(self.problems)

    @callback
    def async_evaluate_all(self) -> bool:
        """Evaluate every watched pair. Returns True when something changed."""
        changed = False
        for watch in self.config.watches:
            for entity_id in self.resolved.get(watch.id, set()):
                changed |= self._evaluate_pair(watch, entity_id)
        return changed

    @callback
    def _evaluate_pair(self, watch: Watch, entity_id: str) -> bool:
        """Advance the lifecycle of one (watch, entity) pair."""
        key = (watch.id, entity_id)
        problem = self.problems.get(key)
        was_matching = problem is not None and problem.status != ProblemStatus.OK

        result = None
        condition_type = ""
        for condition in watch.conditions:
            outcome = evaluate(
                self.hass, condition, entity_id, was_matching=was_matching
            )
            if outcome.matched:
                result = outcome
                condition_type = condition.type
                break

        if result is None:
            return self._clear(watch, key, problem)
        return self._raise(watch, key, entity_id, problem, result, condition_type)

    @callback
    def _clear(
        self, watch: Watch, key: tuple[str, str], problem: ProblemState | None
    ) -> bool:
        """Resolve a problem that no longer matches any condition."""
        if problem is None:
            return False
        was_active = problem.is_active
        del self.problems[key]
        self._state_dirty = True
        if was_active:
            self.hass.bus.async_fire(
                EVENT_CLEARED,
                {
                    "watch_id": watch.id,
                    "watch_name": watch.name,
                    "entity_id": problem.entity_id,
                    "duration": time.time() - problem.since,
                },
            )
            if watch.notify_on_clear:
                self.dispatcher.async_send_clear(self.config, watch, problem)
            self.hass.async_create_task(
                self.history.async_record_clear(watch.id, problem.entity_id)
            )
        return True

    @callback
    def _raise(
        self,
        watch: Watch,
        key: tuple[str, str],
        entity_id: str,
        problem: ProblemState | None,
        result: ConditionResult,
        condition_type: str,
    ) -> bool:
        """Create or advance a problem whose condition currently matches."""
        now = time.time()
        changed = False

        if problem is None:
            problem = ProblemState(
                watch_id=watch.id,
                entity_id=entity_id,
                status=ProblemStatus.PENDING,
                condition_type=condition_type,
                reason=result.text,
                reason_key=result.key,
                reason_params=result.params,
                since=now,
            )
            self.problems[key] = problem
            changed = True
        elif problem.reason != result.text or problem.condition_type != condition_type:
            problem.reason = result.text
            problem.reason_key = result.key
            problem.reason_params = result.params
            problem.condition_type = condition_type
            changed = True

        suppression = self.suppression.check(self.config, watch, entity_id, problem)
        if problem.suppression != suppression:
            problem.suppression = suppression
            changed = True
        if suppression != SuppressionReason.NONE:
            # A suppression the user asked for withdraws an announcement that
            # is already out; a system suppression only stops new ones.
            if suppression in USER_SUPPRESSIONS and problem.is_active:
                self.dispatcher.async_withdraw(watch, problem)
                problem.status = ProblemStatus.PENDING
                problem.alerted_at = 0.0
                problem.escalated_at = 0.0
                problem.last_notified_at = 0.0
                changed = True
            self._state_dirty |= changed
            return changed

        if problem.status == ProblemStatus.PENDING:
            if now - problem.since < watch.grace_period:
                self._state_dirty |= changed
                return changed
            if self._overlapped(watch, entity_id):
                self._state_dirty |= changed
                return changed
            problem.status = ProblemStatus.ALERTED
            problem.alerted_at = now
            problem.last_notified_at = now
            self._fire_alert(EVENT_ALERT, watch, problem)
            return True

        severity = self.config.severity(watch.severity_id)
        if severity is None:
            return changed

        if (
            problem.status == ProblemStatus.ALERTED
            and severity.escalation_after > 0
            and now - problem.alerted_at >= severity.escalation_after
        ):
            problem.status = ProblemStatus.ESCALATED
            problem.escalated_at = now
            problem.last_notified_at = now
            self._fire_alert(EVENT_ESCALATED, watch, problem)
            return True

        if (
            severity.repeat_interval > 0
            and now - problem.last_notified_at >= severity.repeat_interval
        ):
            problem.last_notified_at = now
            self._fire_alert(EVENT_ALERT, watch, problem, repeat=True)
            return True

        self._state_dirty |= changed
        return changed

    @callback
    def _overlapped(self, watch: Watch, entity_id: str) -> bool:
        """Return True when a higher severity watch already covers this entity."""
        if watch.overlap_mode != OverlapMode.HIGHEST_SEVERITY:
            return False
        own = self.config.severity(watch.severity_id)
        own_priority = own.priority if own else 0

        for other in self.config.watches:
            if other.id == watch.id:
                continue
            if entity_id not in self.resolved.get(other.id, set()):
                continue
            other_problem = self.problems.get((other.id, entity_id))
            if other_problem is None or not other_problem.is_active:
                continue
            other_severity = self.config.severity(other.severity_id)
            if other_severity and other_severity.priority > own_priority:
                return True
        return False

    @callback
    def _fire_alert(
        self,
        event_type: str,
        watch: Watch,
        problem: ProblemState,
        *,
        repeat: bool = False,
    ) -> None:
        """Emit the bus event and hand the problem to the notifier."""
        self._state_dirty = True
        severity = self.config.severity(watch.severity_id)
        self.hass.bus.async_fire(
            event_type,
            {
                "watch_id": watch.id,
                "watch_name": watch.name,
                "entity_id": problem.entity_id,
                "severity": severity.name if severity else "",
                "condition": problem.condition_type,
                "reason": problem.reason,
                "repeat": repeat,
            },
        )
        escalated = event_type == EVENT_ESCALATED
        self.dispatcher.async_send_alert(
            self.config, watch, problem, escalated=escalated
        )
        if not repeat:
            self.hass.async_create_task(
                self._async_log(watch, problem, escalated=escalated)
            )

    async def _async_log(
        self, watch: Watch, problem: ProblemState, *, escalated: bool
    ) -> None:
        """Write the announcement to the incident history."""
        if escalated:
            await self.history.async_record_escalation(watch.id, problem.entity_id)
            return

        severity = self.config.severity(watch.severity_id)
        state = self.hass.states.get(problem.entity_id)
        await self.history.async_record_alert(
            IncidentRecord(
                watch_id=watch.id,
                watch_name=watch.name,
                severity_id=watch.severity_id,
                severity_name=severity.name if severity else None,
                entity_id=problem.entity_id,
                friendly_name=(state.attributes.get("friendly_name") if state else None)
                or problem.entity_id,
                condition_type=problem.condition_type,
                reason_key=problem.reason_key,
                reason_params=json.dumps(problem.reason_params, ensure_ascii=False),
                reason_text=problem.reason,
                started_at=problem.since,
                alerted_at=problem.alerted_at or time.time(),
            )
        )

    @callback
    def async_problems_for_watch(self, watch_id: str) -> list[ProblemState]:
        """Return the active problems belonging to one watch."""
        return [
            problem
            for (wid, _), problem in self.problems.items()
            if wid == watch_id and problem.is_active
        ]

    @callback
    def async_active_problems(self) -> list[ProblemState]:
        """Return every problem that has been announced."""
        return [problem for problem in self.problems.values() if problem.is_active]
