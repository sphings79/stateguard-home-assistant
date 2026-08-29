"""WebSocket commands backing the StateGuard panel."""

from __future__ import annotations

from dataclasses import asdict
import logging
import time
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import (
    area_registry as ar,
    entity_registry as er,
    floor_registry as fr,
    label_registry as lr,
)
import voluptuous as vol

from .channels import CHANNEL_FIELDS, SECRET_PLACEHOLDER, secret_keys
from .const import DOMAIN
from .engine import StateGuardEngine
from .links import async_links
from .models import Channel, Settings, Severity, Target, Watch, new_id
from .panel import async_register_panel
from .templates import TEMPLATES

_LOGGER = logging.getLogger(__name__)


@callback
def async_register_websocket_api(hass: HomeAssistant) -> None:
    """Register every panel command once."""
    websocket_api.async_register_command(hass, ws_get_config)
    websocket_api.async_register_command(hass, ws_get_status)
    websocket_api.async_register_command(hass, ws_save_watch)
    websocket_api.async_register_command(hass, ws_delete_watch)
    websocket_api.async_register_command(hass, ws_save_severity)
    websocket_api.async_register_command(hass, ws_delete_severity)
    websocket_api.async_register_command(hass, ws_save_settings)
    websocket_api.async_register_command(hass, ws_preview_target)
    websocket_api.async_register_command(hass, ws_set_monitoring)
    websocket_api.async_register_command(hass, ws_save_channel)
    websocket_api.async_register_command(hass, ws_delete_channel)
    websocket_api.async_register_command(hass, ws_test_channel)
    websocket_api.async_register_command(hass, ws_history)
    websocket_api.async_register_command(hass, ws_history_stats)
    websocket_api.async_register_command(hass, ws_card_data)


@callback
def _restart_grace_until(engine: StateGuardEngine) -> float | None:
    """Return when the last restart grace period expires, or None if over.

    Watches may override the global value, so this reports the longest one
    still running — that is the point from which everything reports again.
    """
    settings = engine.config.settings
    deadlines = [
        engine.suppression.started_at
        + (
            watch.restart_grace
            if watch.restart_grace is not None
            else settings.restart_grace_period
        )
        for watch in engine.config.watches
        if watch.enabled
    ]
    if not deadlines:
        return None
    latest = max(deadlines)
    return latest if latest > time.time() else None


@callback
def _masked_config(engine: StateGuardEngine) -> dict[str, Any]:
    """Return the configuration with channel secrets replaced by a placeholder."""
    data = engine.config.to_dict()
    for channel in data.get("channels", []):
        config = channel.get("config") or {}
        for key in secret_keys(channel.get("kind", "")):
            if config.get(key):
                config[key] = SECRET_PLACEHOLDER
    return data


@callback
def _unmask(engine: StateGuardEngine, incoming: Channel) -> Channel:
    """Put stored secrets back where the browser sent the placeholder."""
    existing = next((c for c in engine.config.channels if c.id == incoming.id), None)
    if existing is None:
        return incoming
    for key in secret_keys(incoming.kind):
        if incoming.config.get(key) == SECRET_PLACEHOLDER:
            incoming.config[key] = existing.config.get(key, "")
    return incoming


def _engine(hass: HomeAssistant) -> StateGuardEngine | None:
    """Return the running engine, if the integration is set up."""
    entries = hass.config_entries.async_loaded_entries(DOMAIN)
    return entries[0].runtime_data if entries else None


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "stateguard/config/get"})
@websocket_api.async_response
async def ws_get_config(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return the configuration plus everything the selectors need."""
    engine = _engine(hass)
    if engine is None:
        connection.send_error(msg["id"], "not_loaded", "StateGuard is not set up")
        return

    label_registry = lr.async_get(hass)
    area_registry = ar.async_get(hass)
    floor_registry = fr.async_get(hass)
    entity_registry = er.async_get(hass)

    domains = sorted({entry.domain for entry in entity_registry.entities.values()})
    integrations = [
        {"id": entry.entry_id, "domain": entry.domain, "title": entry.title}
        for entry in hass.config_entries.async_entries()
        if entry.domain != DOMAIN
    ]
    integrations.sort(key=lambda item: item["title"].lower())

    connection.send_result(
        msg["id"],
        {
            "config": _masked_config(engine),
            "meta": {
                "channel_fields": {
                    kind: list(fields) for kind, fields in CHANNEL_FIELDS.items()
                },
                "labels": [
                    {
                        "id": label.label_id,
                        "name": label.name,
                        "icon": label.icon,
                        "color": label.color,
                        "description": label.description,
                    }
                    for label in sorted(
                        label_registry.async_list_labels(),
                        key=lambda item: item.name.lower(),
                    )
                ],
                "areas": [
                    {"id": area.id, "name": area.name, "floor_id": area.floor_id}
                    for area in sorted(
                        area_registry.async_list_areas(),
                        key=lambda item: item.name.lower(),
                    )
                ],
                "floors": [
                    {"id": floor.floor_id, "name": floor.name}
                    for floor in sorted(
                        floor_registry.async_list_floors(),
                        key=lambda item: item.name.lower(),
                    )
                ],
                "domains": domains,
                "integrations": integrations,
                "templates": list(TEMPLATES),
            },
        },
    )


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "stateguard/status"})
@websocket_api.async_response
async def ws_get_status(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return every problem the engine currently tracks."""
    engine = _engine(hass)
    if engine is None:
        connection.send_error(msg["id"], "not_loaded", "StateGuard is not set up")
        return

    problems = []
    for problem in engine.problems.values():
        watch = engine.config.watch(problem.watch_id)
        severity = engine.config.severity(watch.severity_id) if watch else None
        state = hass.states.get(problem.entity_id)
        problems.append(
            {
                **problem.to_dict(),
                "watch_name": watch.name if watch else problem.watch_id,
                "severity_id": watch.severity_id if watch else None,
                "severity_name": severity.name if severity else None,
                "severity_priority": severity.priority if severity else 0,
                "friendly_name": (
                    state.attributes.get("friendly_name") if state else None
                )
                or problem.entity_id,
                "current_state": state.state if state else None,
                **async_links(hass, problem.entity_id).as_dict(),
            }
        )
    problems.sort(key=lambda item: (-item["severity_priority"], item["since"]))

    connection.send_result(
        msg["id"],
        {
            "problems": problems,
            "watched_entity_count": len(engine.watched_entities),
            "resolved": {
                watch_id: len(entity_ids)
                for watch_id, entity_ids in engine.resolved.items()
            },
            "monitoring_enabled": engine.config.settings.monitoring_enabled,
            "restart_grace_until": _restart_grace_until(engine),
            "internet_down": engine.suppression.async_internet_down(
                engine.config.settings.internet_entity
            ),
        },
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "stateguard/watch/save", vol.Required("watch"): dict}
)
@websocket_api.async_response
async def ws_save_watch(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create or update a single watch."""
    engine = _engine(hass)
    if engine is None:
        connection.send_error(msg["id"], "not_loaded", "StateGuard is not set up")
        return

    raw = dict(msg["watch"])
    raw.setdefault("id", new_id())
    watch = Watch.from_dict(raw)

    watches = engine.config.watches
    for index, existing in enumerate(watches):
        if existing.id == watch.id:
            watches[index] = watch
            break
    else:
        watch.order = len(watches)
        watches.append(watch)

    await engine.store.async_save()
    await engine.async_config_changed()
    connection.send_result(msg["id"], {"watch": asdict(watch)})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "stateguard/watch/delete", vol.Required("watch_id"): str}
)
@websocket_api.async_response
async def ws_delete_watch(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove a watch and everything the engine tracked for it."""
    engine = _engine(hass)
    if engine is None:
        connection.send_error(msg["id"], "not_loaded", "StateGuard is not set up")
        return

    watch_id = msg["watch_id"]
    before = len(engine.config.watches)
    engine.config.watches = [w for w in engine.config.watches if w.id != watch_id]
    if len(engine.config.watches) == before:
        connection.send_error(msg["id"], "not_found", watch_id)
        return

    await engine.store.async_save()
    await engine.async_config_changed()
    connection.send_result(msg["id"], {"deleted": watch_id})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "stateguard/severity/save", vol.Required("severity"): dict}
)
@websocket_api.async_response
async def ws_save_severity(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create or update a severity level."""
    engine = _engine(hass)
    if engine is None:
        connection.send_error(msg["id"], "not_loaded", "StateGuard is not set up")
        return

    raw = dict(msg["severity"])
    raw.setdefault("id", new_id())
    severity = Severity.from_dict(raw)

    severities = engine.config.severities
    for index, existing in enumerate(severities):
        if existing.id == severity.id:
            severities[index] = severity
            break
    else:
        severities.append(severity)

    await engine.store.async_save()
    await engine.async_config_changed()
    connection.send_result(msg["id"], {"severity": asdict(severity)})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "stateguard/severity/delete",
        vol.Required("severity_id"): str,
    }
)
@websocket_api.async_response
async def ws_delete_severity(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove a severity, refusing while watches still use it."""
    engine = _engine(hass)
    if engine is None:
        connection.send_error(msg["id"], "not_loaded", "StateGuard is not set up")
        return

    severity_id = msg["severity_id"]
    in_use = [w.name for w in engine.config.watches if w.severity_id == severity_id]
    if in_use:
        # The panel turns the code plus these names into a localised sentence.
        connection.send_error(msg["id"], "in_use", ", ".join(in_use))
        return

    engine.config.severities = [
        s for s in engine.config.severities if s.id != severity_id
    ]
    await engine.store.async_save()
    await engine.async_config_changed()
    connection.send_result(msg["id"], {"deleted": severity_id})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "stateguard/settings/save", vol.Required("settings"): dict}
)
@websocket_api.async_response
async def ws_save_settings(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Replace the global settings."""
    engine = _engine(hass)
    if engine is None:
        connection.send_error(msg["id"], "not_loaded", "StateGuard is not set up")
        return

    engine.config.settings = Settings.from_dict(msg["settings"])
    await engine.store.async_save()
    await engine.async_config_changed()
    # The sidebar entry has to be replaced when its visibility changes.
    await async_register_panel(
        hass, require_admin=engine.config.settings.panel_access != "all"
    )
    connection.send_result(msg["id"], {"settings": asdict(engine.config.settings)})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "stateguard/preview", vol.Required("target"): dict}
)
@websocket_api.async_response
async def ws_preview_target(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Resolve a target without saving, so the editor can show what it covers."""
    engine = _engine(hass)
    if engine is None:
        connection.send_error(msg["id"], "not_loaded", "StateGuard is not set up")
        return

    entity_ids = sorted(engine.resolver.resolve(Target.from_dict(msg["target"])))
    entities = []
    for entity_id in entity_ids:
        state = hass.states.get(entity_id)
        entities.append(
            {
                "entity_id": entity_id,
                "friendly_name": (
                    state.attributes.get("friendly_name") if state else None
                )
                or entity_id,
                "state": state.state if state else None,
                **async_links(hass, entity_id).as_dict(),
            }
        )

    connection.send_result(msg["id"], {"count": len(entities), "entities": entities})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "stateguard/monitoring/set",
        vol.Required("enabled"): bool,
    }
)
@websocket_api.async_response
async def ws_set_monitoring(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Pause or resume monitoring without guessing the switch's entity id."""
    engine = _engine(hass)
    if engine is None:
        connection.send_error(msg["id"], "not_loaded", "StateGuard is not set up")
        return

    engine.config.settings.monitoring_enabled = msg["enabled"]
    await engine.store.async_save()
    await engine.async_config_changed()
    connection.send_result(msg["id"], {"enabled": msg["enabled"]})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "stateguard/channel/save", vol.Required("channel"): dict}
)
@websocket_api.async_response
async def ws_save_channel(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create or update a notification channel."""
    engine = _engine(hass)
    if engine is None:
        connection.send_error(msg["id"], "not_loaded", "")
        return

    raw = dict(msg["channel"])
    raw.setdefault("id", new_id())
    channel = _unmask(engine, Channel.from_dict(raw))

    channels = engine.config.channels
    for index, existing in enumerate(channels):
        if existing.id == channel.id:
            channels[index] = channel
            break
    else:
        channels.append(channel)

    await engine.store.async_save()
    await engine.async_config_changed()
    connection.send_result(msg["id"], {"channel_id": channel.id})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "stateguard/channel/delete", vol.Required("channel_id"): str}
)
@websocket_api.async_response
async def ws_delete_channel(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Remove a channel and detach it from every severity and watch."""
    engine = _engine(hass)
    if engine is None:
        connection.send_error(msg["id"], "not_loaded", "")
        return

    channel_id = msg["channel_id"]
    engine.config.channels = [
        channel for channel in engine.config.channels if channel.id != channel_id
    ]
    for severity in engine.config.severities:
        severity.channels = [c for c in severity.channels if c != channel_id]
        severity.escalation_channels = [
            c for c in severity.escalation_channels if c != channel_id
        ]
    for watch in engine.config.watches:
        watch.channels = [c for c in watch.channels if c != channel_id]

    await engine.store.async_save()
    await engine.async_config_changed()
    connection.send_result(msg["id"], {"deleted": channel_id})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): "stateguard/channel/test", vol.Required("channel"): dict}
)
@websocket_api.async_response
async def ws_test_channel(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Send a test message through a channel, saved or not."""
    engine = _engine(hass)
    if engine is None:
        connection.send_error(msg["id"], "not_loaded", "")
        return

    channel = _unmask(engine, Channel.from_dict(dict(msg["channel"])))
    error = await engine.dispatcher.async_test_channel(channel)
    connection.send_result(msg["id"], {"ok": error is None, "error": error})


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "stateguard/history",
        vol.Optional("limit", default=100): vol.All(int, vol.Range(min=1, max=1000)),
        vol.Optional("offset", default=0): vol.All(int, vol.Range(min=0)),
        vol.Optional("watch_id"): vol.Any(str, None),
        vol.Optional("severity_id"): vol.Any(str, None),
        vol.Optional("entity_id"): vol.Any(str, None),
        vol.Optional("days"): vol.Any(int, None),
        vol.Optional("open_only", default=False): bool,
    }
)
@websocket_api.async_response
async def ws_history(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return past incidents, newest first."""
    engine = _engine(hass)
    if engine is None:
        connection.send_error(msg["id"], "not_loaded", "")
        return

    days = msg.get("days")
    result = await engine.history.async_list(
        limit=msg["limit"],
        offset=msg["offset"],
        watch_id=msg.get("watch_id"),
        severity_id=msg.get("severity_id"),
        entity_id=msg.get("entity_id"),
        since=time.time() - days * 86400 if days else None,
        open_only=msg["open_only"],
    )
    connection.send_result(msg["id"], result)


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "stateguard/history/stats",
        vol.Optional("days", default=30): vol.All(int, vol.Range(min=1, max=3650)),
    }
)
@websocket_api.async_response
async def ws_history_stats(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return which watches and entities caused the most incidents."""
    engine = _engine(hass)
    if engine is None:
        connection.send_error(msg["id"], "not_loaded", "")
        return

    stats = await engine.history.async_statistics(time.time() - msg["days"] * 86400)
    connection.send_result(msg["id"], stats)


@websocket_api.websocket_command({vol.Required("type"): "stateguard/card"})
@websocket_api.async_response
async def ws_card_data(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return what the card and the read-only overview need.

    Deliberately not admin-only, otherwise the card stays empty for every
    ordinary user. It carries only what is needed to display a problem —
    no channels, no credentials, no settings beyond the two banners.
    """
    engine = _engine(hass)
    if engine is None:
        connection.send_error(msg["id"], "not_loaded", "")
        return

    problems = []
    for problem in engine.problems.values():
        watch = engine.config.watch(problem.watch_id)
        severity = engine.config.severity(watch.severity_id) if watch else None
        state = hass.states.get(problem.entity_id)
        problems.append(
            {
                "watch_id": problem.watch_id,
                "watch_name": watch.name if watch else problem.watch_id,
                "entity_id": problem.entity_id,
                "status": problem.status,
                "suppression": problem.suppression,
                "since": problem.since,
                "reason": problem.reason,
                "reason_key": problem.reason_key,
                "reason_params": problem.reason_params,
                "severity_id": watch.severity_id if watch else None,
                "severity_name": severity.name if severity else None,
                "severity_priority": severity.priority if severity else 0,
                "friendly_name": (
                    state.attributes.get("friendly_name") if state else None
                )
                or problem.entity_id,
                "current_state": state.state if state else None,
                **async_links(hass, problem.entity_id).as_dict(),
            }
        )
    problems.sort(key=lambda item: (-item["severity_priority"], item["since"]))

    connection.send_result(
        msg["id"],
        {
            "problems": problems,
            "severities": [
                {
                    "id": severity.id,
                    "name": severity.name,
                    "color": severity.color,
                    "icon": severity.icon,
                    "priority": severity.priority,
                }
                for severity in engine.config.severities
            ],
            "watch_count": len(engine.config.watches),
            "watched_entity_count": len(engine.watched_entities),
            "monitoring_enabled": engine.config.settings.monitoring_enabled,
            "restart_grace_until": _restart_grace_until(engine),
            "internet_down": engine.suppression.async_internet_down(
                engine.config.settings.internet_entity
            ),
        },
    )
