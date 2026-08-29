"""Where an entity can be inspected in the Home Assistant interface.

Used by the panel (as data for its context menu) and by notifications (as
markdown links), so both point at the same places.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from urllib.parse import quote

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.network import NoURLAvailableError, get_url


@dataclass(slots=True)
class EntityLinks:
    """The places a problematic entity can be looked at."""

    entity_id: str
    device_id: str | None = None
    device_name: str | None = None
    integration_domain: str | None = None
    integration_title: str | None = None

    @property
    def history_path(self) -> str:
        """Path to this entity's history."""
        return f"/history?entity_id={quote(self.entity_id)}"

    @property
    def device_path(self) -> str | None:
        """Path to the device page, when the entity belongs to one."""
        return f"/config/devices/device/{self.device_id}" if self.device_id else None

    @property
    def integration_path(self) -> str | None:
        """Path to the integration page, when the integration is known."""
        if not self.integration_domain:
            return None
        return f"/config/integrations/integration/{self.integration_domain}"

    def absolute(self, hass: HomeAssistant, path: str | None) -> str | None:
        """Turn a path into a full URL for messages that leave the house.

        Prefers the external URL so a link works from outside; the companion
        app picks such a link up and opens it in the app instead of a browser.
        """
        if not path:
            return None
        try:
            base = get_url(hass, prefer_external=True)
        except NoURLAvailableError:
            return None
        return f"{base.rstrip('/')}{path}"

    def as_dict(self) -> dict[str, Any]:
        """Return the fields the panel needs for its context menu."""
        return {
            "device_id": self.device_id,
            "device_name": self.device_name,
            "integration_domain": self.integration_domain,
            "integration_title": self.integration_title,
        }


@callback
def async_links(hass: HomeAssistant, entity_id: str) -> EntityLinks:
    """Look up the device and integration behind an entity."""
    links = EntityLinks(entity_id=entity_id)
    entry = er.async_get(hass).async_get(entity_id)
    if entry is None:
        return links

    if entry.device_id:
        device = dr.async_get(hass).async_get(entry.device_id)
        if device:
            links.device_id = device.id
            links.device_name = device.name_by_user or device.name

    if entry.config_entry_id:
        config_entry = hass.config_entries.async_get_entry(entry.config_entry_id)
        if config_entry:
            links.integration_domain = config_entry.domain
            links.integration_title = config_entry.title
    elif entry.platform:
        links.integration_domain = entry.platform
        links.integration_title = entry.platform
    return links
