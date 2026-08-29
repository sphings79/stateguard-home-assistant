"""Global on/off switch for monitoring."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import StateGuardConfigEntry
from .const import DOMAIN
from .engine import StateGuardEngine
from .entity import StateGuardEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: StateGuardConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Create the monitoring switch."""
    async_add_entities([MonitoringSwitch(entry.runtime_data)])


class MonitoringSwitch(StateGuardEntity, SwitchEntity):
    """Pauses or resumes every watch at once."""

    _attr_translation_key = "monitoring"

    def __init__(self, engine: StateGuardEngine) -> None:
        """Create the global switch."""
        super().__init__(engine)
        self._attr_unique_id = f"{DOMAIN}_monitoring"

    @property
    def is_on(self) -> bool:
        """Return whether monitoring is currently active."""
        return self.engine.config.settings.monitoring_enabled

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Resume monitoring."""
        await self._async_set(True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Pause monitoring."""
        await self._async_set(False)

    async def _async_set(self, enabled: bool) -> None:
        """Persist the new setting and re-evaluate immediately."""
        self.engine.config.settings.monitoring_enabled = enabled
        await self.engine.store.async_save()
        await self.engine.async_config_changed()
