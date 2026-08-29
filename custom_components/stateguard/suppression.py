"""Decides whether a problem that would fire is held back, and why."""

from __future__ import annotations

from datetime import datetime, time as dt_time
import logging
import time

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.util import dt as dt_util

from .const import SuppressionReason
from .models import Config, ProblemState, QuietWindow, Watch

_LOGGER = logging.getLogger(__name__)

OFF_STATES = ("off", "unavailable", "unknown", "false")


class SuppressionEngine:
    """Applies the suppression chain in a fixed, documented order."""

    def __init__(self, hass: HomeAssistant, started_at: float) -> None:
        """Remember when this run began, for the restart grace period."""
        self.hass = hass
        self.started_at = started_at

    @callback
    def check(
        self,
        config: Config,
        watch: Watch,
        entity_id: str,
        problem: ProblemState | None,
    ) -> str:
        """Return the reason this problem is suppressed, or NONE."""
        settings = config.settings
        now = time.time()

        if not settings.monitoring_enabled:
            return SuppressionReason.MONITORING_OFF
        if not watch.enabled:
            return SuppressionReason.WATCH_DISABLED
        if problem is not None and problem.snoozed_until > now:
            return SuppressionReason.SNOOZED
        if problem is not None and problem.acknowledged:
            return SuppressionReason.ACKNOWLEDGED

        grace = (
            watch.restart_grace
            if watch.restart_grace is not None
            else settings.restart_grace_period
        )
        if now - self.started_at < grace:
            return SuppressionReason.RESTART_GRACE

        if self.async_internet_down(settings.internet_entity):
            return SuppressionReason.INTERNET_DOWN
        if self._integration_down(entity_id):
            return SuppressionReason.INTEGRATION_DOWN
        if watch.suppress_by_parent and self._parent_down(entity_id):
            return SuppressionReason.PARENT_DOWN

        return SuppressionReason.NONE

    @callback
    def in_quiet_hours(self, config: Config) -> bool:
        """Return True when the current local time falls into any quiet window."""
        quiet = config.settings.quiet_hours
        if not quiet.enabled:
            return False

        now = dt_util.now()
        return any(self._window_covers(window, now) for window in quiet.windows)

    @callback
    def _window_covers(self, window: QuietWindow, now: datetime) -> bool:
        """Return True when a window is in force at this moment.

        A window that wraps past midnight belongs to the day it started on, so
        "Friday 23:00 to 07:00" still covers early Saturday morning.
        """
        start = _parse_time(window.start)
        end = _parse_time(window.end)
        if start is None or end is None:
            return False

        current = now.time()
        if start <= end:
            return now.weekday() in window.weekdays and start <= current < end

        if current >= start:
            return now.weekday() in window.weekdays
        # Before the end time, so this belongs to yesterday's window.
        yesterday = (now.weekday() - 1) % 7
        return yesterday in window.weekdays and current < end

    @callback
    def async_internet_down(self, entity_id: str | None) -> bool:
        """Return True when the configured connectivity entity reports down."""
        if not entity_id:
            return False
        state = self.hass.states.get(entity_id)
        if state is None:
            return False
        return state.state.lower() in OFF_STATES

    @callback
    def _integration_down(self, entity_id: str) -> bool:
        """Return True when the entity's config entry is not loaded."""
        entry = er.async_get(self.hass).async_get(entity_id)
        if entry is None or entry.config_entry_id is None:
            return False
        config_entry = self.hass.config_entries.async_get_entry(entry.config_entry_id)
        if config_entry is None:
            return False
        return config_entry.state is not ConfigEntryState.LOADED

    @callback
    def _parent_down(self, entity_id: str) -> bool:
        """Return True when a device further up the chain is itself down.

        Walks `via_device` upwards. A parent counts as down when it has
        entities of its own and every one of them is unavailable — the usual
        picture when a bridge or coordinator drops off.
        """
        entity_registry = er.async_get(self.hass)
        device_registry = dr.async_get(self.hass)

        entry = entity_registry.async_get(entity_id)
        if entry is None or entry.device_id is None:
            return False

        device = device_registry.async_get(entry.device_id)
        seen: set[str] = set()
        while device is not None and device.via_device_id:
            if device.via_device_id in seen:
                break
            seen.add(device.via_device_id)
            parent = device_registry.async_get(device.via_device_id)
            if parent is None:
                break
            if self._device_is_down(entity_registry, parent.id):
                return True
            device = parent
        return False

    @callback
    def _device_is_down(
        self, entity_registry: er.EntityRegistry, device_id: str
    ) -> bool:
        """Return True when every entity of a device is unavailable."""
        entries = [
            entry
            for entry in er.async_entries_for_device(entity_registry, device_id)
            if entry.disabled_by is None
        ]
        if not entries:
            return False
        states = [self.hass.states.get(entry.entity_id) for entry in entries]
        present = [state for state in states if state is not None]
        if not present:
            return False
        return all(state.state in ("unavailable", "unknown") for state in present)


def _parse_time(value: str) -> dt_time | None:
    """Parse an 'HH:MM' string into a time object."""
    try:
        hour, minute = (int(part) for part in value.split(":", 1))
        return dt_time(hour, minute)
    except (ValueError, AttributeError):
        _LOGGER.warning("Cannot parse quiet hours time '%s'", value)
        return None
