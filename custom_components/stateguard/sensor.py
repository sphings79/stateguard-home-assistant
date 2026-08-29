"""Problem counters: one total and one per severity."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity, SensorStateClass
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import StateGuardConfigEntry
from .const import DOMAIN
from .engine import SIGNAL_UPDATED, StateGuardEngine
from .entity import StateGuardEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: StateGuardConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create the total counter plus one counter per configured severity."""
    engine = entry.runtime_data
    async_add_entities([TotalProblemsSensor(engine)])
    known: set[str] = set()

    @callback
    def _sync() -> None:
        """Track severities being added or removed in the panel."""
        current = {severity.id for severity in engine.config.severities}
        added = current - known

        # See binary_sensor: adding entities re-enters this callback, so the
        # bookkeeping has to happen first.
        known.update(current)
        if added:
            async_add_entities(
                SeverityProblemsSensor(engine, severity_id) for severity_id in added
            )

        # See binary_sensor: orphans are found through the registry, so a
        # severity deleted while this instance was down is cleaned up too.
        registry = er.async_get(hass)
        prefix = f"{DOMAIN}_problems_"
        for registry_entry in er.async_entries_for_config_entry(
            registry, entry.entry_id
        ):
            if registry_entry.domain != "sensor":
                continue
            if not registry_entry.unique_id.startswith(prefix):
                continue
            if registry_entry.unique_id.removeprefix(prefix) not in current:
                registry.async_remove(registry_entry.entity_id)
        known.intersection_update(current)

    _sync()
    entry.async_on_unload(async_dispatcher_connect(hass, SIGNAL_UPDATED, _sync))


class TotalProblemsSensor(StateGuardEntity, SensorEntity):
    """Counts every active problem across all watches."""

    _attr_translation_key = "problems"
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_native_unit_of_measurement = "problems"

    def __init__(self, engine: StateGuardEngine) -> None:
        """Create the global counter."""
        super().__init__(engine)
        self._attr_unique_id = f"{DOMAIN}_problems"

    @property
    def native_value(self) -> int:
        """Return the number of active problems."""
        return len(self.engine.async_active_problems())

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Break the total down by watch and list the affected entities."""
        problems = self.engine.async_active_problems()
        by_watch: dict[str, int] = {}
        for problem in problems:
            watch = self.engine.config.watch(problem.watch_id)
            name = watch.name if watch else problem.watch_id
            by_watch[name] = by_watch.get(name, 0) + 1
        return {
            "entities": sorted({p.entity_id for p in problems}),
            "by_watch": by_watch,
            "watched_entity_count": len(self.engine.watched_entities),
            "watch_count": len(self.engine.config.watches),
        }


class SeverityProblemsSensor(StateGuardEntity, SensorEntity):
    """Counts the active problems of one severity."""

    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_native_unit_of_measurement = "problems"

    def __init__(self, engine: StateGuardEngine, severity_id: str) -> None:
        """Bind the counter to one severity."""
        super().__init__(engine)
        self._severity_id = severity_id
        self._attr_unique_id = self.build_unique_id(severity_id)

    @staticmethod
    def build_unique_id(severity_id: str) -> str:
        """Return the unique id used for a severity's counter."""
        return f"{DOMAIN}_problems_{severity_id}"

    @property
    def name(self) -> str:
        """Return 'Problems <severity>' using the current severity name."""
        severity = self.engine.config.severity(self._severity_id)
        return f"Problems {severity.name}" if severity else self._severity_id

    @property
    def available(self) -> bool:
        """Report unavailable once the severity has been deleted."""
        return self.engine.config.severity(self._severity_id) is not None

    @property
    def icon(self) -> str | None:
        """Use the severity's own icon."""
        severity = self.engine.config.severity(self._severity_id)
        return severity.icon if severity else None

    @property
    def native_value(self) -> int:
        """Return how many active problems carry this severity."""
        return len(self._problems())

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """List the entities behind the count."""
        return {"entities": sorted({p.entity_id for p in self._problems()})}

    def _problems(self) -> list:
        """Return the active problems belonging to this severity."""
        watch_ids = {
            watch.id
            for watch in self.engine.config.watches
            if watch.severity_id == self._severity_id
        }
        return [
            problem
            for problem in self.engine.async_active_problems()
            if problem.watch_id in watch_ids
        ]
