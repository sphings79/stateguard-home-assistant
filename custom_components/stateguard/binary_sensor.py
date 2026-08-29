"""One problem binary sensor per watch."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util

from . import StateGuardConfigEntry
from .const import DOMAIN
from .engine import SIGNAL_UPDATED, StateGuardEngine
from .entity import StateGuardEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: StateGuardConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create one sensor per watch and keep the set in sync with the config."""
    engine = entry.runtime_data
    # What this run has created. Cleaning up orphans works off the registry
    # instead, so the two never interfere.
    known: set[str] = set()

    @callback
    def _sync() -> None:
        """Add sensors for new watches and drop those whose watch is gone."""
        current = {watch.id for watch in engine.config.watches}
        added = current - known

        # Mark them known *before* adding: async_add_entities writes to the
        # entity registry synchronously, which fires a registry event that
        # brings us straight back into _sync. Without this the nested call
        # would try to add the same entities a second time.
        known.update(current)
        if added:
            async_add_entities(
                WatchProblemSensor(engine, watch_id) for watch_id in added
            )

        # Drop sensors whose watch is gone — including ones left behind by a
        # deletion that happened while this instance was not running.
        registry = er.async_get(hass)
        prefix = f"{DOMAIN}_watch_"
        for registry_entry in er.async_entries_for_config_entry(
            registry, entry.entry_id
        ):
            if registry_entry.domain != "binary_sensor":
                continue
            if not registry_entry.unique_id.startswith(prefix):
                continue
            if registry_entry.unique_id.removeprefix(prefix) not in current:
                registry.async_remove(registry_entry.entity_id)
        known.intersection_update(current)

    _sync()
    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_UPDATED, _sync))


class WatchProblemSensor(StateGuardEntity, BinarySensorEntity):
    """Reports whether a watch currently has active problems."""

    _attr_device_class = BinarySensorDeviceClass.PROBLEM

    def __init__(self, engine: StateGuardEngine, watch_id: str) -> None:
        """Bind the sensor to one watch."""
        super().__init__(engine)
        self._watch_id = watch_id
        self._attr_unique_id = self.build_unique_id(watch_id)

    @staticmethod
    def build_unique_id(watch_id: str) -> str:
        """Return the unique id used for a watch's sensor."""
        return f"{DOMAIN}_watch_{watch_id}"

    @property
    def name(self) -> str:
        """Return the watch's name, falling back to its id."""
        watch = self.engine.config.watch(self._watch_id)
        return watch.name if watch and watch.name else self._watch_id

    @property
    def available(self) -> bool:
        """Report unavailable once the watch has been deleted."""
        return self.engine.config.watch(self._watch_id) is not None

    @property
    def icon(self) -> str | None:
        """Use the severity icon so the list reads at a glance."""
        watch = self.engine.config.watch(self._watch_id)
        if watch is None:
            return None
        severity = self.engine.config.severity(watch.severity_id)
        return severity.icon if severity else None

    @property
    def is_on(self) -> bool:
        """Return True while at least one problem is active."""
        return bool(self.engine.async_problems_for_watch(self._watch_id))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Expose the affected entities so automations can use them."""
        watch = self.engine.config.watch(self._watch_id)
        problems = self.engine.async_problems_for_watch(self._watch_id)
        severity = self.engine.config.severity(watch.severity_id) if watch else None
        oldest = min((p.since for p in problems), default=0.0)
        return {
            "watch_id": self._watch_id,
            "severity": severity.name if severity else None,
            "problem_count": len(problems),
            "entities": sorted(p.entity_id for p in problems),
            "reasons": {p.entity_id: p.reason for p in problems},
            "watched_entity_count": len(
                self.engine.resolved.get(self._watch_id, set())
            ),
            "oldest_problem": (
                dt_util.utc_from_timestamp(oldest).isoformat() if oldest else None
            ),
            "suppressed": sorted(
                {
                    p.suppression
                    for (wid, _), p in self.engine.problems.items()
                    if wid == self._watch_id and p.suppression != "none"
                }
            ),
        }
