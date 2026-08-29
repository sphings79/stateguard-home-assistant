"""The StateGuard integration for Home Assistant."""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import PLATFORMS
from .engine import StateGuardEngine
from .panel import async_register_card, async_register_panel, async_remove_panel
from .services import async_register_services
from .store import StateGuardStore
from .websocket_api import async_register_websocket_api

_LOGGER = logging.getLogger(__name__)

type StateGuardConfigEntry = ConfigEntry[StateGuardEngine]


async def async_setup_entry(hass: HomeAssistant, entry: StateGuardConfigEntry) -> bool:
    """Set up StateGuard from a config entry."""
    store = StateGuardStore(hass)
    await store.async_load()

    engine = StateGuardEngine(hass, store)
    await engine.async_start()
    entry.runtime_data = engine

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    async_register_services(hass)
    async_register_websocket_api(hass)
    await async_register_panel(
        hass, require_admin=store.config.settings.panel_access != "all"
    )
    await async_register_card(hass)

    entry.async_on_unload(entry.add_update_listener(_async_update_listener))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: StateGuardConfigEntry) -> bool:
    """Unload a config entry."""
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        await entry.runtime_data.async_stop()
    return unloaded


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Delete the stored configuration when the entry is removed."""
    async_remove_panel(hass)
    await StateGuardStore(hass).async_remove()


async def _async_update_listener(
    hass: HomeAssistant, entry: StateGuardConfigEntry
) -> None:
    """Reload the entry when its options change."""
    await hass.config_entries.async_reload(entry.entry_id)
