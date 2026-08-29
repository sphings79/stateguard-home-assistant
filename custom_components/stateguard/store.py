"""Persistent storage for StateGuard configuration and runtime state."""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    STORAGE_KEY_CONFIG,
    STORAGE_KEY_STATE,
    STORAGE_VERSION_CONFIG,
    STORAGE_VERSION_STATE,
)
from .models import Config, ProblemState, Severity

_LOGGER = logging.getLogger(__name__)

SEVERITY_NAMES: dict[str, dict[str, str]] = {
    "en": {
        "info": "Info",
        "warning": "Warning",
        "critical": "Critical",
        "security": "Security",
    },
    "de": {
        "info": "Info",
        "warning": "Warnung",
        "critical": "Kritisch",
        "security": "Sicherheit",
    },
}

DEFAULT_SEVERITIES: tuple[dict[str, Any], ...] = (
    {
        "id": "info",
        "name": "Info",
        "priority": 10,
        "color": "blue-grey",
        "icon": "mdi:information-outline",
        "persistent_notification": False,
    },
    {
        "id": "warning",
        "name": "Warning",
        "priority": 50,
        "color": "amber",
        "icon": "mdi:alert-outline",
    },
    {
        "id": "critical",
        "name": "Critical",
        "priority": 80,
        "color": "red",
        "icon": "mdi:alert",
        "bundle_window": 0,
    },
    {
        "id": "security",
        "name": "Security",
        "priority": 90,
        "color": "deep-purple",
        "icon": "mdi:shield-alert",
        "bundle_window": 0,
        "ignore_quiet_hours": True,
    },
)


class StateGuardStore:
    """Loads and saves the configuration and the runtime problem state."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Set up both stores."""
        self._hass = hass
        self._config_store: Store[dict[str, Any]] = Store(
            hass, STORAGE_VERSION_CONFIG, STORAGE_KEY_CONFIG
        )
        self._state_store: Store[dict[str, Any]] = Store(
            hass, STORAGE_VERSION_STATE, STORAGE_KEY_STATE
        )
        self.config = Config()

    async def async_load(self) -> Config:
        """Load the configuration, seeding defaults on first start."""
        data = await self._config_store.async_load()
        if data is None:
            # Name the defaults in the interface language; the user can rename
            # them afterwards like any other severity.
            language = (self._hass.config.language or "en").split("-")[0]
            names = SEVERITY_NAMES.get(language, SEVERITY_NAMES["en"])
            self.config = Config(
                severities=[
                    Severity.from_dict(
                        {
                            **severity,
                            "name": names.get(severity["id"], severity["name"]),
                        }
                    )
                    for severity in DEFAULT_SEVERITIES
                ]
            )
            await self.async_save()
            _LOGGER.debug("No stored configuration found, seeded default severities")
        else:
            self.config = Config.from_dict(data)
        return self.config

    async def async_save(self) -> None:
        """Write the configuration to disk."""
        await self._config_store.async_save(self.config.to_dict())

    async def async_load_problems(self) -> dict[tuple[str, str], ProblemState]:
        """Restore the runtime problem state from the previous run."""
        data = await self._state_store.async_load()
        if not data:
            return {}
        problems: dict[tuple[str, str], ProblemState] = {}
        for raw in data.get("problems") or []:
            try:
                problem = ProblemState.from_dict(raw)
            except TypeError:
                _LOGGER.warning("Discarding unreadable problem state: %s", raw)
                continue
            problems[problem.key] = problem
        return problems

    async def async_save_problems(
        self, problems: dict[tuple[str, str], ProblemState]
    ) -> None:
        """Persist the runtime problem state so a restart does not re-alert."""
        await self._state_store.async_save(
            {"problems": [p.to_dict() for p in problems.values()]}
        )

    async def async_remove(self) -> None:
        """Delete both stores when the integration is removed."""
        await self._config_store.async_remove()
        await self._state_store.async_remove()
