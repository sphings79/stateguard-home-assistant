"""Config flow for StateGuard.

There is nothing to ask for: everything is configured in the panel afterwards,
so the flow only confirms that the single instance should be created.
"""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN


class StateGuardConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the one-step setup flow."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Confirm creation of the single StateGuard instance."""
        if user_input is None:
            return self.async_show_form(step_id="user")
        return self.async_create_entry(title="StateGuard", data={})
