"""Constants for the StateGuard integration."""

from __future__ import annotations

from enum import StrEnum
from typing import Final

DOMAIN: Final = "stateguard"
PLATFORMS: Final = ["binary_sensor", "sensor", "switch"]

STORAGE_KEY_CONFIG: Final = f"{DOMAIN}.config"
STORAGE_VERSION_CONFIG: Final = 1
STORAGE_KEY_STATE: Final = f"{DOMAIN}.state"
STORAGE_VERSION_STATE: Final = 1

# Interval for stale detection, grace period expiry, repeats and escalation.
SCAN_INTERVAL_SECONDS: Final = 30

DEFAULT_GRACE_PERIOD: Final = 300
DEFAULT_RESTART_GRACE: Final = 600
DEFAULT_BUNDLE_WINDOW: Final = 60
DEFAULT_HISTORY_RETENTION_DAYS: Final = 90

EVENT_ALERT: Final = f"{DOMAIN}_alert"
EVENT_ESCALATED: Final = f"{DOMAIN}_escalated"
EVENT_CLEARED: Final = f"{DOMAIN}_cleared"

UNAVAILABLE_STATES: Final = ("unavailable", "unknown", "", "none")


class ConditionType(StrEnum):
    """Kind of check a condition performs."""

    UNAVAILABLE_STATE = "unavailable_state"
    STALE = "stale"
    NUMERIC_THRESHOLD = "numeric_threshold"
    STATE_MATCH = "state_match"
    STATE_DURATION = "state_duration"
    ENTITY_MISSING = "entity_missing"


class TimeBasis(StrEnum):
    """Timestamp a stale check measures against."""

    LAST_REPORTED = "last_reported"
    LAST_UPDATED = "last_updated"
    LAST_CHANGED = "last_changed"


class Operator(StrEnum):
    """Comparison used by a numeric threshold condition."""

    LT = "lt"
    LE = "le"
    GT = "gt"
    GE = "ge"
    OUTSIDE = "outside"
    INSIDE = "inside"


class LabelMode(StrEnum):
    """How multiple labels in a target combine."""

    ANY = "any"
    ALL = "all"


class OverlapMode(StrEnum):
    """What happens when several watches cover the same entity."""

    ALL = "all"
    HIGHEST_SEVERITY = "highest_severity"


class ProblemStatus(StrEnum):
    """Lifecycle of a single (watch, entity) problem."""

    OK = "ok"
    PENDING = "pending"
    ALERTED = "alerted"
    ESCALATED = "escalated"


class SuppressionReason(StrEnum):
    """Why an otherwise firing problem is held back."""

    NONE = "none"
    MONITORING_OFF = "monitoring_off"
    WATCH_DISABLED = "watch_disabled"
    SNOOZED = "snoozed"
    ACKNOWLEDGED = "acknowledged"
    RESTART_GRACE = "restart_grace"
    INTERNET_DOWN = "internet_down"
    INTEGRATION_DOWN = "integration_down"
    PARENT_DOWN = "parent_down"
    QUIET_HOURS = "quiet_hours"


# Suppressions the user asked for. These withdraw a problem that is already
# announced: the sensor goes off and the notification is taken back. When the
# suppression ends the problem is announced again from scratch.
USER_SUPPRESSIONS: Final = (
    SuppressionReason.MONITORING_OFF,
    SuppressionReason.WATCH_DISABLED,
    SuppressionReason.SNOOZED,
    SuppressionReason.ACKNOWLEDGED,
)

# Suppressions the system decides on. These only hold back *new* alerts —
# something already announced before the outage stays announced, so a restart
# or a dead bridge does not re-notify about problems the user knows about.
SYSTEM_SUPPRESSIONS: Final = (
    SuppressionReason.RESTART_GRACE,
    SuppressionReason.INTERNET_DOWN,
    SuppressionReason.INTEGRATION_DOWN,
    SuppressionReason.PARENT_DOWN,
)
