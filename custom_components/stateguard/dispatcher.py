"""Turns problems into messages and gets them to the configured channels.

Responsibilities, in the order they apply:

1. Collect alerts for a moment so several problems become one message.
2. Hold messages back during quiet hours and send them afterwards, but only
   while the problem still stands.
3. Pick the channels: the severity's, plus the watch's own, plus the
   escalation channels once a problem escalated.
4. Render title and body once, then hand them to every channel.
"""

from __future__ import annotations

from dataclasses import dataclass, field
import logging
import time
from typing import TYPE_CHECKING, Any

from homeassistant.components import persistent_notification
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.template import Template

from .channels import HANDLERS, RenderedMessage
from .channels.base import ChannelError
from .const import DOMAIN
from .l10n import translate
from .links import async_links
from .models import Channel, Config, ProblemState, Severity, Watch

if TYPE_CHECKING:
    from .engine import StateGuardEngine

_LOGGER = logging.getLogger(__name__)


@dataclass(slots=True)
class Pending:
    """One announcement waiting to be bundled or held back."""

    watch_id: str
    entity_id: str
    escalated: bool = False
    is_clear: bool = False
    queued_at: float = 0.0
    deferred: bool = False


@dataclass(slots=True)
class _Group:
    """Announcements that belong in one message."""

    watch: Watch
    severity: Severity
    is_clear: bool
    escalated: bool
    problems: list[ProblemState] = field(default_factory=list)


class Dispatcher:
    """Bundles announcements and delivers them."""

    def __init__(self, hass: HomeAssistant, engine: StateGuardEngine) -> None:
        """Keep a reference to the engine for config and problem lookups."""
        self.hass = hass
        self.engine = engine
        self._pending: list[Pending] = []

    @property
    def config(self) -> Config:
        """Return the current configuration."""
        return self.engine.config

    # ------------------------------------------------------------------
    # Queueing
    # ------------------------------------------------------------------

    @callback
    def async_send_alert(
        self,
        config: Config,
        watch: Watch,
        problem: ProblemState,
        *,
        escalated: bool = False,
    ) -> None:
        """Queue a problem announcement."""
        self._queue(watch, problem, escalated=escalated, is_clear=False)

    @callback
    def async_send_clear(
        self, config: Config, watch: Watch, problem: ProblemState
    ) -> None:
        """Queue an all-clear and take the standing notification back."""
        persistent_notification.async_dismiss(
            self.hass, self._notification_id(watch, problem)
        )
        self._queue(watch, problem, escalated=False, is_clear=True)

    @callback
    def async_withdraw(self, watch: Watch, problem: ProblemState) -> None:
        """Take an announcement back without claiming the problem is solved."""
        _LOGGER.debug(
            "Withdrawn (%s) | %s | %s",
            problem.suppression,
            watch.name,
            problem.entity_id,
        )
        persistent_notification.async_dismiss(
            self.hass, self._notification_id(watch, problem)
        )
        # Anything still waiting for this pair no longer applies.
        self._pending = [
            item
            for item in self._pending
            if not (item.watch_id == watch.id and item.entity_id == problem.entity_id)
        ]

    @callback
    def _queue(
        self, watch: Watch, problem: ProblemState, *, escalated: bool, is_clear: bool
    ) -> None:
        """Put an announcement in the buffer, flushing at once when required."""
        severity = self.config.severity(watch.severity_id)
        window = severity.bundle_window if severity else 0
        if not watch.group_alerts:
            window = 0

        self._pending.append(
            Pending(
                watch_id=watch.id,
                entity_id=problem.entity_id,
                escalated=escalated,
                is_clear=is_clear,
                queued_at=time.time(),
            )
        )
        if window <= 0:
            self.hass.async_create_task(self.async_flush())

    # ------------------------------------------------------------------
    # Flushing
    # ------------------------------------------------------------------

    async def async_tick(self) -> None:
        """Flush the buffer; called from the engine's periodic pass."""
        await self.async_flush()

    async def async_flush(self) -> None:
        """Send everything whose bundling window has passed."""
        if not self._pending:
            return

        now = time.time()
        quiet = self.engine.suppression.in_quiet_hours(self.config)
        ready: list[Pending] = []
        keep: list[Pending] = []

        for item in self._pending:
            watch = self.config.watch(item.watch_id)
            severity = self.config.severity(watch.severity_id) if watch else None
            if watch is None or severity is None:
                continue  # The watch was deleted while we waited.

            window = severity.bundle_window if watch.group_alerts else 0
            if not item.deferred and now - item.queued_at < window:
                keep.append(item)
                continue

            if quiet and not severity.ignore_quiet_hours:
                # Hold it back; it goes out once quiet hours are over.
                item.deferred = True
                keep.append(item)
                continue

            ready.append(item)

        self._pending = keep
        if not ready:
            return

        for group in self._group(ready):
            await self._async_deliver(group)

    @callback
    def _group(self, items: list[Pending]) -> list[_Group]:
        """Collect announcements into one message per watch and kind."""
        groups: dict[tuple[str, bool, bool], _Group] = {}
        for item in items:
            watch = self.config.watch(item.watch_id)
            severity = self.config.severity(watch.severity_id) if watch else None
            if watch is None or severity is None:
                continue

            problem = self.engine.problems.get((item.watch_id, item.entity_id))
            if problem is None:
                if not item.is_clear:
                    # Resolved while it was waiting — nothing to announce.
                    continue
                problem = ProblemState(watch_id=item.watch_id, entity_id=item.entity_id)
            elif item.deferred and not item.is_clear and not problem.is_active:
                # Held back over quiet hours and no longer a problem.
                continue

            key = (watch.id, item.is_clear, item.escalated)
            group = groups.get(key)
            if group is None:
                group = _Group(
                    watch=watch,
                    severity=severity,
                    is_clear=item.is_clear,
                    escalated=item.escalated,
                )
                groups[key] = group
            group.problems.append(problem)
        return list(groups.values())

    # ------------------------------------------------------------------
    # Delivery
    # ------------------------------------------------------------------

    async def _async_deliver(self, group: _Group) -> None:
        """Render the message and send it everywhere it belongs."""
        default = self._render(group)

        if group.severity.persistent_notification and not group.is_clear:
            for problem in group.problems:
                persistent_notification.async_create(
                    self.hass,
                    self._single_body(problem),
                    title=default.title,
                    notification_id=self._notification_id(group.watch, problem),
                )

        variables = self._variables(group)
        for channel in self._channels_for(group):
            # A channel may bring its own wording; otherwise it gets the
            # message that was already rendered.
            message = default
            if channel.title_template or channel.template:
                message = RenderedMessage(
                    title=self._render_template(channel.title_template, variables)
                    if channel.title_template
                    else default.title,
                    body=self._render_template(channel.template, variables)
                    if channel.template
                    else default.body,
                    severity=default.severity,
                    watch=default.watch,
                    entity_ids=default.entity_ids,
                    url=default.url,
                    is_clear=default.is_clear,
                )
            await self._async_send_to(channel, message)

    @callback
    def _channels_for(self, group: _Group) -> list[Channel]:
        """Return the channels this announcement goes to, without duplicates."""
        wanted = list(group.severity.channels) + list(group.watch.channels)
        if group.escalated:
            wanted += list(group.severity.escalation_channels)

        seen: set[str] = set()
        channels: list[Channel] = []
        for channel_id in wanted:
            if channel_id in seen:
                continue
            seen.add(channel_id)
            channel = next(
                (c for c in self.config.channels if c.id == channel_id), None
            )
            if channel is not None and channel.enabled:
                channels.append(channel)
        return channels

    async def _async_send_to(self, channel: Channel, message: RenderedMessage) -> None:
        """Deliver through one channel, logging rather than raising on failure."""
        handler = HANDLERS.get(channel.kind)
        if handler is None:
            _LOGGER.error(
                "Unknown channel kind '%s' on '%s'", channel.kind, channel.name
            )
            return
        try:
            await handler.async_send(self.hass, channel, message)
        except ChannelError as err:
            _LOGGER.error("Channel '%s' failed: %s", channel.name, err)
        except Exception:
            _LOGGER.exception("Channel '%s' raised unexpectedly", channel.name)

    async def async_test_channel(self, channel: Channel) -> str | None:
        """Send a test message. Returns an error text, or None on success."""
        handler = HANDLERS.get(channel.kind)
        if handler is None:
            return f"Unknown channel kind '{channel.kind}'"
        missing = handler.validate(channel.config)
        if missing:
            return f"missing:{missing}"

        language = self.hass.config.language
        message = RenderedMessage(
            title=translate(language, "test.title"),
            body=translate(language, "test.body"),
        )
        try:
            await handler.async_send(self.hass, channel, message)
        except ChannelError as err:
            return str(err)
        except Exception as err:
            _LOGGER.exception("Test of channel '%s' failed", channel.name)
            return str(err)
        return None

    # ------------------------------------------------------------------
    # Rendering
    # ------------------------------------------------------------------

    @callback
    def _render(self, group: _Group) -> RenderedMessage:
        """Build title and body, using the channel-independent templates."""
        language = self.hass.config.language
        variables = self._variables(group)

        if group.is_clear:
            title_key, body_key = "template.clear_title", "template.clear_body"
        elif group.escalated:
            title_key, body_key = "template.escalated_title", "template.body"
        else:
            title_key, body_key = "template.title", "template.body"

        title = self._render_template(translate(language, title_key), variables)
        body = self._render_template(translate(language, body_key), variables)

        first = group.problems[0] if group.problems else None
        url = None
        if first is not None:
            links = async_links(self.hass, first.entity_id)
            url = links.absolute(self.hass, links.history_path)

        return RenderedMessage(
            title=title,
            body=body,
            severity=group.severity.name,
            watch=group.watch.name,
            entity_ids=[problem.entity_id for problem in group.problems],
            url=url,
            is_clear=group.is_clear,
        )

    @callback
    def _variables(self, group: _Group) -> dict[str, Any]:
        """Assemble what a message template can use."""
        language = self.hass.config.language
        problems = []
        for problem in group.problems:
            state = self.hass.states.get(problem.entity_id)
            links = async_links(self.hass, problem.entity_id)
            problems.append(
                {
                    "entity_id": problem.entity_id,
                    "name": (state.attributes.get("friendly_name") if state else None)
                    or problem.entity_id,
                    "state": state.state if state else None,
                    "reason": translate(
                        language,
                        f"reason.{problem.reason_key}",
                        problem.reason_params,
                    )
                    if problem.reason_key
                    else problem.reason,
                    "since": problem.since,
                    "device": links.device_name,
                    "integration": links.integration_title,
                    "url": links.absolute(self.hass, links.history_path),
                    "device_url": links.absolute(self.hass, links.device_path),
                    "integration_url": links.absolute(
                        self.hass, links.integration_path
                    ),
                }
            )
        return {
            "watch": group.watch.name,
            "severity": group.severity.name,
            "count": len(problems),
            "problems": problems,
            "escalated": group.escalated,
        }

    @callback
    def _render_template(self, source: str, variables: dict[str, Any]) -> str:
        """Render a Jinja2 template, falling back to its source on error."""
        try:
            return Template(source, self.hass).async_render(
                variables, parse_result=False
            )
        except Exception as err:
            _LOGGER.error("Could not render message template: %s", err)
            return source

    @callback
    def _single_body(self, problem: ProblemState) -> str:
        """Body for the per-entity persistent notification."""
        language = self.hass.config.language
        state = self.hass.states.get(problem.entity_id)
        name = (
            state.attributes.get("friendly_name") if state else None
        ) or problem.entity_id
        reason = (
            translate(language, f"reason.{problem.reason_key}", problem.reason_params)
            if problem.reason_key
            else problem.reason
        )
        links = async_links(self.hass, problem.entity_id)
        parts = [f"[{translate(language, 'link.history')}]({links.history_path})"]
        if links.device_path:
            parts.append(
                f"[{links.device_name or translate(language, 'link.device')}]"
                f"({links.device_path})"
            )
        if links.integration_path:
            label = links.integration_title or translate(language, "link.integration")
            parts.append(f"[{label}]({links.integration_path})")
        links_line = " · ".join(parts)
        return f"**{name}** (`{problem.entity_id}`)\n\n{reason}\n\n{links_line}"

    @callback
    def _notification_id(self, watch: Watch, problem: ProblemState) -> str:
        """Return a stable id so repeats replace rather than stack."""
        return f"{DOMAIN}_{watch.id}_{problem.entity_id}"
