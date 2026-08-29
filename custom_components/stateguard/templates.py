"""Ready-made watches so a new installation is useful within a minute.

Each template leaves the target empty — the user picks the labels in the
panel and everything else is already sensible. Name and description live in
the frontend catalogue under `template.<template_id>`, so they appear in the
user's language.
"""

from __future__ import annotations

from typing import Any, Final

# Battery levels are often reported in coarse steps (Homematic reports
# 100 / 75 / 50 / 37.5 / 25 / 0), so a limit of 20 % would only ever fire at
# zero. 25 % with a recovery threshold of 40 % catches the real transition.
BATTERY_LIMIT: Final = 25.0
BATTERY_RECOVERY: Final = 40.0

TEMPLATES: Final[tuple[dict[str, Any], ...]] = (
    {
        "template_id": "availability",
        "icon": "mdi:lan-disconnect",
        "watch": {
            "severity_id": "warning",
            "grace_period": 300,
            "conditions": [
                {"type": "unavailable_state", "states": ["unavailable", "unknown"]}
            ],
        },
    },
    {
        "template_id": "battery_low",
        "icon": "mdi:battery-alert-variant-outline",
        "watch": {
            "severity_id": "info",
            "grace_period": 0,
            "conditions": [
                {
                    "type": "numeric_threshold",
                    "source": "state",
                    "operator": "le",
                    "value": BATTERY_LIMIT,
                    "recovery_value": BATTERY_RECOVERY,
                }
            ],
        },
    },
    {
        "template_id": "no_data",
        "icon": "mdi:timer-sand-empty",
        "watch": {
            "severity_id": "warning",
            "grace_period": 0,
            "conditions": [
                {"type": "stale", "time_basis": "last_reported", "duration": 86400}
            ],
        },
    },
    {
        "template_id": "security_devices",
        "icon": "mdi:shield-home-outline",
        "watch": {
            "severity_id": "security",
            "grace_period": 60,
            "conditions": [
                {"type": "unavailable_state", "states": ["unavailable", "unknown"]}
            ],
        },
    },
    {
        "template_id": "missing_entities",
        "icon": "mdi:file-remove-outline",
        "watch": {
            "severity_id": "warning",
            "grace_period": 600,
            "conditions": [{"type": "entity_missing"}],
        },
    },
)
