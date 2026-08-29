"""Shared base class for every entity StateGuard creates."""

from __future__ import annotations

from homeassistant.core import callback
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import Entity

from .const import DOMAIN
from .engine import SIGNAL_UPDATED, StateGuardEngine


class StateGuardEntity(Entity):
    """Groups all entities under one service device and keeps them in sync."""

    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(self, engine: StateGuardEngine) -> None:
        """Attach the entity to the engine and the shared device."""
        self.engine = engine
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, DOMAIN)},
            name="StateGuard",
            manufacturer="sphings79",
            entry_type=None,
        )

    async def async_added_to_hass(self) -> None:
        """Subscribe to engine updates."""
        self.async_on_remove(
            async_dispatcher_connect(self.hass, SIGNAL_UPDATED, self._handle_update)
        )

    @callback
    def _handle_update(self) -> None:
        """Refresh the entity after the engine changed something."""
        self.async_write_ha_state()
