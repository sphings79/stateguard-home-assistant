"""Service calls exposed by StateGuard."""

from __future__ import annotations

from datetime import timedelta
import logging
import time
from typing import Any

from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
    callback,
)
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.util import dt as dt_util
import voluptuous as vol

from .const import DOMAIN
from .engine import SIGNAL_UPDATED, StateGuardEngine
from .models import Config

_LOGGER = logging.getLogger(__name__)

SERVICE_SNOOZE = "snooze"
SERVICE_ACKNOWLEDGE = "acknowledge"
SERVICE_CLEAR_ACKNOWLEDGEMENT = "clear_acknowledgement"
SERVICE_PAUSE_WATCH = "pause_watch"
SERVICE_RESUME_WATCH = "resume_watch"
SERVICE_RUN_CHECK = "run_check"
SERVICE_EXPORT_CONFIG = "export_config"
SERVICE_IMPORT_CONFIG = "import_config"

SNOOZE_DURATIONS = {
    "1h": 3600,
    "8h": 28800,
    "24h": 86400,
}
SNOOZE_UNTIL_MORNING = "until_morning"
MORNING_HOUR = 7

SNOOZE_SCHEMA = vol.Schema(
    {
        vol.Optional("watch_id"): cv.string,
        vol.Optional("entity_id"): cv.entity_id,
        vol.Required("duration", default="8h"): vol.In(
            [*SNOOZE_DURATIONS, SNOOZE_UNTIL_MORNING]
        ),
    }
)
TARGET_SCHEMA = vol.Schema(
    {
        vol.Optional("watch_id"): cv.string,
        vol.Optional("entity_id"): cv.entity_id,
    }
)
WATCH_SCHEMA = vol.Schema({vol.Required("watch_id"): cv.string})
IMPORT_SCHEMA = vol.Schema({vol.Required("config"): dict})


@callback
def async_register_services(hass: HomeAssistant) -> None:
    """Register every service once, no matter how often entries are set up."""
    if hass.services.has_service(DOMAIN, SERVICE_SNOOZE):
        return

    async def _snooze(call: ServiceCall) -> None:
        """Hold back alerts for a watch, an entity, or one pair."""
        engine = _engine(hass)
        duration = call.data["duration"]
        if duration == SNOOZE_UNTIL_MORNING:
            until = _next_morning()
        else:
            until = time.time() + SNOOZE_DURATIONS[duration]

        touched = 0
        for problem in _select(engine, call.data):
            problem.snoozed_until = until
            touched += 1
        _LOGGER.debug("Snoozed %d problem(s) until %s", touched, until)
        _notify_change(hass, engine)

    async def _acknowledge(call: ServiceCall) -> None:
        """Stop alerting for the selected problems until they clear."""
        engine = _engine(hass)
        for problem in _select(engine, call.data):
            problem.acknowledged = True
        _notify_change(hass, engine)

    async def _clear_acknowledgement(call: ServiceCall) -> None:
        """Undo an acknowledgement."""
        engine = _engine(hass)
        for problem in _select(engine, call.data):
            problem.acknowledged = False
            problem.snoozed_until = 0.0
        _notify_change(hass, engine)

    async def _pause_watch(call: ServiceCall) -> None:
        """Disable a single watch."""
        await _set_watch_enabled(hass, call.data["watch_id"], enabled=False)

    async def _resume_watch(call: ServiceCall) -> None:
        """Re-enable a single watch."""
        await _set_watch_enabled(hass, call.data["watch_id"], enabled=True)

    async def _run_check(call: ServiceCall) -> None:
        """Evaluate every watch right now instead of waiting for the tick."""
        engine = _engine(hass)
        engine.async_refresh_targets()
        engine.async_evaluate_all()
        _notify_change(hass, engine)

    async def _export_config(call: ServiceCall) -> ServiceResponse:
        """Return the full configuration for backup purposes."""
        return {"config": _engine(hass).config.to_dict()}

    async def _import_config(call: ServiceCall) -> None:
        """Replace the configuration with a previously exported one."""
        engine = _engine(hass)
        try:
            engine.store.config = Config.from_dict(call.data["config"])
        except (TypeError, ValueError, AttributeError) as err:
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="invalid_config",
                translation_placeholders={"error": str(err)},
            ) from err
        await engine.store.async_save()
        await engine.async_config_changed()

    hass.services.async_register(DOMAIN, SERVICE_SNOOZE, _snooze, SNOOZE_SCHEMA)
    hass.services.async_register(
        DOMAIN, SERVICE_ACKNOWLEDGE, _acknowledge, TARGET_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_CLEAR_ACKNOWLEDGEMENT, _clear_acknowledgement, TARGET_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_PAUSE_WATCH, _pause_watch, WATCH_SCHEMA
    )
    hass.services.async_register(
        DOMAIN, SERVICE_RESUME_WATCH, _resume_watch, WATCH_SCHEMA
    )
    hass.services.async_register(DOMAIN, SERVICE_RUN_CHECK, _run_check)
    hass.services.async_register(
        DOMAIN,
        SERVICE_EXPORT_CONFIG,
        _export_config,
        supports_response=SupportsResponse.ONLY,
    )
    hass.services.async_register(
        DOMAIN, SERVICE_IMPORT_CONFIG, _import_config, IMPORT_SCHEMA
    )


def _engine(hass: HomeAssistant) -> StateGuardEngine:
    """Return the running engine, or explain that the integration is not set up."""
    entries = hass.config_entries.async_loaded_entries(DOMAIN)
    if not entries:
        raise ServiceValidationError(
            translation_domain=DOMAIN, translation_key="not_set_up"
        )
    return entries[0].runtime_data


def _select(engine: StateGuardEngine, data: dict[str, Any]) -> list:
    """Return the problems addressed by watch_id and/or entity_id."""
    watch_id = data.get("watch_id")
    entity_id = data.get("entity_id")
    return [
        problem
        for (wid, eid), problem in engine.problems.items()
        if (watch_id is None or wid == watch_id)
        and (entity_id is None or eid == entity_id)
    ]


async def _set_watch_enabled(
    hass: HomeAssistant, watch_id: str, *, enabled: bool
) -> None:
    """Flip a watch on or off and persist the change."""
    engine = _engine(hass)
    watch = engine.config.watch(watch_id)
    if watch is None:
        raise ServiceValidationError(
            translation_domain=DOMAIN,
            translation_key="watch_not_found",
            translation_placeholders={"watch_id": watch_id},
        )
    watch.enabled = enabled
    await engine.store.async_save()
    await engine.async_config_changed()


def _next_morning() -> float:
    """Return the timestamp of the next local morning."""
    now = dt_util.now()
    morning = now.replace(hour=MORNING_HOUR, minute=0, second=0, microsecond=0)
    if morning <= now:
        morning += timedelta(days=1)
    return morning.timestamp()


@callback
def _notify_change(hass: HomeAssistant, engine: StateGuardEngine) -> None:
    """Push the change to the entities."""
    async_dispatcher_send(hass, SIGNAL_UPDATED)
