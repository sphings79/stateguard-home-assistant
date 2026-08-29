"""Data model for StateGuard configuration and runtime state."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field, fields
from typing import Any
from uuid import uuid4

from .const import (
    DEFAULT_BUNDLE_WINDOW,
    DEFAULT_GRACE_PERIOD,
    DEFAULT_HISTORY_RETENTION_DAYS,
    DEFAULT_RESTART_GRACE,
    ConditionType,
    LabelMode,
    Operator,
    OverlapMode,
    ProblemStatus,
    SuppressionReason,
    TimeBasis,
)


def new_id() -> str:
    """Return a short identifier for a newly created object."""
    return uuid4().hex[:12]


@dataclass(slots=True)
class Target:
    """Selects the entities a watch applies to."""

    labels: list[str] = field(default_factory=list)
    label_mode: str = LabelMode.ANY
    areas: list[str] = field(default_factory=list)
    floors: list[str] = field(default_factory=list)
    domains: list[str] = field(default_factory=list)
    integrations: list[str] = field(default_factory=list)
    entities: list[str] = field(default_factory=list)
    include_device_entities: bool = True
    include_diagnostic: bool = False
    exclude_labels: list[str] = field(default_factory=list)
    exclude_entities: list[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Target:
        """Build a target from stored data, tolerating missing keys."""
        known = {f.name for f in fields(cls)}
        return cls(**{k: v for k, v in data.items() if k in known})

    def is_empty(self) -> bool:
        """Return True when the target selects nothing at all."""
        return not any(
            (
                self.labels,
                self.areas,
                self.floors,
                self.domains,
                self.integrations,
                self.entities,
            )
        )


@dataclass(slots=True)
class Condition:
    """A single check performed against an entity."""

    type: str = ConditionType.UNAVAILABLE_STATE
    # unavailable_state / state_match
    states: list[str] = field(default_factory=list)
    negate: bool = False
    # stale / state_duration
    time_basis: str = TimeBasis.LAST_REPORTED
    duration: int = 3600
    target_state: str | None = None
    # numeric_threshold
    source: str = "state"
    operator: str = Operator.LT
    value: float | None = None
    value2: float | None = None
    recovery_value: float | None = None

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Condition:
        """Build a condition from stored data, tolerating missing keys."""
        known = {f.name for f in fields(cls)}
        return cls(**{k: v for k, v in data.items() if k in known})


@dataclass(slots=True)
class Severity:
    """A named severity level with its notification behaviour."""

    id: str = field(default_factory=new_id)
    name: str = "Warning"
    priority: int = 50
    color: str = "amber"
    icon: str = "mdi:alert"
    channels: list[str] = field(default_factory=list)
    ignore_quiet_hours: bool = False
    persistent_notification: bool = True
    bundle_window: int = DEFAULT_BUNDLE_WINDOW
    repeat_interval: int = 0
    escalation_after: int = 0
    escalation_channels: list[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Severity:
        """Build a severity from stored data, tolerating missing keys."""
        known = {f.name for f in fields(cls)}
        return cls(**{k: v for k, v in data.items() if k in known})


@dataclass(slots=True)
class Watch:
    """A monitoring rule: what to look at, what counts as a problem."""

    id: str = field(default_factory=new_id)
    name: str = ""
    enabled: bool = True
    severity_id: str = ""
    order: int = 0
    target: Target = field(default_factory=Target)
    conditions: list[Condition] = field(default_factory=list)
    grace_period: int = DEFAULT_GRACE_PERIOD
    restart_grace: int | None = None
    overlap_mode: str = OverlapMode.ALL
    notify_on_clear: bool = True
    suppress_by_parent: bool = True
    group_alerts: bool = True
    channels: list[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Watch:
        """Build a watch including its nested target and conditions."""
        known = {f.name for f in fields(cls)} - {"target", "conditions"}
        watch = cls(**{k: v for k, v in data.items() if k in known})
        watch.target = Target.from_dict(data.get("target") or {})
        watch.conditions = [
            Condition.from_dict(c) for c in data.get("conditions") or []
        ]
        return watch


@dataclass(slots=True)
class QuietWindow:
    """One stretch of time on given weekdays during which alerts wait."""

    start: str = "22:00"
    end: str = "07:00"
    weekdays: list[int] = field(default_factory=lambda: [0, 1, 2, 3, 4, 5, 6])

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> QuietWindow:
        """Build a window from stored data, tolerating missing keys."""
        known = {f.name for f in fields(cls)}
        return cls(**{k: v for k, v in data.items() if k in known})


@dataclass(slots=True)
class QuietHours:
    """When notifications are held back.

    Several windows, because weekends usually differ from weekdays: 23:00 to
    07:00 Monday to Friday, 01:00 to 09:00 on Saturday and Sunday.
    """

    enabled: bool = False
    windows: list[QuietWindow] = field(
        default_factory=lambda: [
            QuietWindow(start="22:00", end="07:00", weekdays=[0, 1, 2, 3, 4]),
            QuietWindow(start="23:00", end="09:00", weekdays=[5, 6]),
        ]
    )

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> QuietHours:
        """Build quiet hours, upgrading the single-window format if needed."""
        quiet = cls(enabled=bool(data.get("enabled", False)))
        if "windows" in data:
            quiet.windows = [QuietWindow.from_dict(w) for w in data["windows"] or []]
        elif "start" in data or "end" in data:
            # Configuration written before windows existed.
            quiet.windows = [QuietWindow.from_dict(data)]
        return quiet


@dataclass(slots=True)
class Settings:
    """Global integration settings."""

    monitoring_enabled: bool = True
    restart_grace_period: int = DEFAULT_RESTART_GRACE
    internet_entity: str | None = None
    report_failed_integrations: bool = True
    failed_integrations_scope: str = "watched"  # "watched" | "all"
    quiet_hours: QuietHours = field(default_factory=QuietHours)
    history_retention_days: int = DEFAULT_HISTORY_RETENTION_DAYS
    ui_language: str = "auto"
    # "admin": only administrators see the sidebar entry.
    # "all": everyone sees it, but non-admins get a read-only overview —
    # changing anything stays with administrators either way.
    panel_access: str = "admin"

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Settings:
        """Build settings including nested quiet hours."""
        known = {f.name for f in fields(cls)} - {"quiet_hours"}
        settings = cls(**{k: v for k, v in data.items() if k in known})
        settings.quiet_hours = QuietHours.from_dict(data.get("quiet_hours") or {})
        return settings


@dataclass(slots=True)
class Channel:
    """A notification destination.

    `kind` selects the handler; `config` holds whatever that handler needs
    (a service name, SMTP credentials, a bot token). `title_template` and
    `template` are Jinja2 and may be empty, in which case the built-in
    default for the interface language is used.
    """

    id: str = field(default_factory=new_id)
    name: str = ""
    kind: str = "ha_service"
    enabled: bool = True
    config: dict[str, Any] = field(default_factory=dict)
    title_template: str = ""
    template: str = ""

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Channel:
        """Build a channel from stored data, tolerating missing keys."""
        known = {f.name for f in fields(cls)}
        return cls(**{k: v for k, v in data.items() if k in known})


@dataclass(slots=True)
class Config:
    """The complete stored configuration."""

    watches: list[Watch] = field(default_factory=list)
    severities: list[Severity] = field(default_factory=list)
    channels: list[Channel] = field(default_factory=list)
    settings: Settings = field(default_factory=Settings)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Config:
        """Build the configuration tree from stored data."""
        return cls(
            watches=[Watch.from_dict(w) for w in data.get("watches") or []],
            severities=[Severity.from_dict(s) for s in data.get("severities") or []],
            channels=[Channel.from_dict(c) for c in data.get("channels") or []],
            settings=Settings.from_dict(data.get("settings") or {}),
        )

    def to_dict(self) -> dict[str, Any]:
        """Serialise the configuration for the store."""
        return asdict(self)

    def severity(self, severity_id: str) -> Severity | None:
        """Return the severity with the given id."""
        return next((s for s in self.severities if s.id == severity_id), None)

    def watch(self, watch_id: str) -> Watch | None:
        """Return the watch with the given id."""
        return next((w for w in self.watches if w.id == watch_id), None)


@dataclass(slots=True)
class ProblemState:
    """Runtime state of one (watch, entity) pair."""

    watch_id: str
    entity_id: str
    status: str = ProblemStatus.OK
    condition_type: str = ""
    reason: str = ""
    reason_key: str = ""
    reason_params: dict[str, str] = field(default_factory=dict)
    since: float = 0.0
    alerted_at: float = 0.0
    escalated_at: float = 0.0
    last_notified_at: float = 0.0
    snoozed_until: float = 0.0
    acknowledged: bool = False
    suppression: str = SuppressionReason.NONE

    @property
    def key(self) -> tuple[str, str]:
        """Return the identifying pair for this problem."""
        return (self.watch_id, self.entity_id)

    @property
    def is_active(self) -> bool:
        """Return True when the problem has been announced."""
        return self.status in (ProblemStatus.ALERTED, ProblemStatus.ESCALATED)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ProblemState:
        """Rebuild runtime state after a restart."""
        known = {f.name for f in fields(cls)}
        return cls(**{k: v for k, v in data.items() if k in known})

    def to_dict(self) -> dict[str, Any]:
        """Serialise runtime state so it survives a restart."""
        return asdict(self)
