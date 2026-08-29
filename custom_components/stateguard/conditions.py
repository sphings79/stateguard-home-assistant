"""Evaluation of watch conditions against the current state of an entity.

A match returns a translation key plus its values rather than a finished
sentence, so the panel can render it in the user's language. The English
`text` is only for the log.
"""

from __future__ import annotations

from dataclasses import dataclass, field
import logging

from homeassistant.core import HomeAssistant, State, callback
from homeassistant.util import dt as dt_util

from .const import ConditionType, Operator, TimeBasis
from .models import Condition

_LOGGER = logging.getLogger(__name__)

DEFAULT_UNAVAILABLE_STATES = ("unavailable", "unknown")

# The exact operator does not matter to the reader — the direction does.
OPERATOR_DIRECTION = {
    Operator.LT: "below",
    Operator.LE: "below",
    Operator.GT: "above",
    Operator.GE: "above",
}


@dataclass(slots=True)
class ConditionResult:
    """Outcome of evaluating one condition against one entity."""

    matched: bool
    key: str = ""
    params: dict[str, str] = field(default_factory=dict)
    text: str = ""


NO_MATCH = ConditionResult(False)


@callback
def evaluate(
    hass: HomeAssistant,
    condition: Condition,
    entity_id: str,
    *,
    was_matching: bool = False,
) -> ConditionResult:
    """Check a single condition, honouring hysteresis for numeric thresholds."""
    state = hass.states.get(entity_id)

    if condition.type == ConditionType.ENTITY_MISSING:
        if state is None:
            return ConditionResult(
                True, "entity_missing", {}, "entity no longer exists"
            )
        return NO_MATCH

    if state is None:
        # Every other condition needs a state to look at. A missing entity is
        # only a problem when the watch explicitly asks for it.
        return NO_MATCH

    match condition.type:
        case ConditionType.UNAVAILABLE_STATE:
            return _unavailable_state(condition, state)
        case ConditionType.STALE:
            return _stale(condition, state)
        case ConditionType.NUMERIC_THRESHOLD:
            return _numeric_threshold(condition, state, was_matching)
        case ConditionType.STATE_MATCH:
            return _state_match(condition, state)
        case ConditionType.STATE_DURATION:
            return _state_duration(condition, state)

    _LOGGER.warning("Unknown condition type %s", condition.type)
    return NO_MATCH


@callback
def _unavailable_state(condition: Condition, state: State) -> ConditionResult:
    """Match when the entity sits in one of the configured bad states."""
    wanted = condition.states or list(DEFAULT_UNAVAILABLE_STATES)
    if state.state in wanted:
        return ConditionResult(
            True,
            "unavailable_state",
            {"state": state.state or "—"},
            f"state is '{state.state}'",
        )
    return NO_MATCH


@callback
def _stale(condition: Condition, state: State) -> ConditionResult:
    """Match when the entity has not reported for longer than the limit."""
    timestamp = {
        TimeBasis.LAST_REPORTED: state.last_reported,
        TimeBasis.LAST_UPDATED: state.last_updated,
        TimeBasis.LAST_CHANGED: state.last_changed,
    }.get(condition.time_basis, state.last_reported)

    age = (dt_util.utcnow() - timestamp).total_seconds()
    if age > condition.duration:
        age_text = format_duration(age)
        limit_text = format_duration(condition.duration)
        return ConditionResult(
            True,
            "stale",
            {"age": age_text, "limit": limit_text},
            f"no update for {age_text} (limit {limit_text})",
        )
    return NO_MATCH


@callback
def _numeric_threshold(
    condition: Condition, state: State, was_matching: bool
) -> ConditionResult:
    """Match on a numeric comparison, with an optional recovery threshold."""
    raw = (
        state.state
        if condition.source == "state"
        else state.attributes.get(condition.source)
    )
    try:
        value = float(raw)
    except (TypeError, ValueError):
        return NO_MATCH

    if condition.value is None:
        return NO_MATCH

    # While a problem is active the recovery threshold decides when it clears,
    # so a value hovering around the limit does not flap.
    if was_matching and condition.recovery_value is not None:
        limit = condition.recovery_value
    else:
        limit = condition.value

    label = "" if condition.source == "state" else condition.source
    unit = state.attributes.get("unit_of_measurement") or ""
    number = _with_unit(value, unit)
    # Always show the configured limit. The recovery threshold decides when
    # the problem clears, but quoting it here would read as the wrong reason.
    boundary = _with_unit(condition.value, unit)

    if condition.operator in OPERATOR_DIRECTION:
        direction = OPERATOR_DIRECTION[condition.operator]
        matched = {
            Operator.LT: value < limit,
            Operator.LE: value <= limit,
            Operator.GT: value > limit,
            Operator.GE: value >= limit,
        }[condition.operator]
        params = {"attribute": label, "value": number, "limit": boundary}
        key = f"numeric_{direction}"
        if label:
            key += "_attribute"
        text = f"{label + ' ' if label else ''}{number} ({direction} {boundary})"
        return ConditionResult(True, key, params, text) if matched else NO_MATCH

    upper = condition.value2
    if upper is None:
        return NO_MATCH
    upper_text = _with_unit(upper, unit)
    lower_text = _with_unit(condition.value, unit)
    params = {
        "attribute": label,
        "value": number,
        "lower": lower_text,
        "upper": upper_text,
    }
    if condition.operator == Operator.OUTSIDE:
        matched = value < limit or value > upper
        key = "numeric_outside"
        word = "outside"
    elif condition.operator == Operator.INSIDE:
        matched = limit <= value <= upper
        key = "numeric_inside"
        word = "inside"
    else:
        return NO_MATCH
    if label:
        key += "_attribute"
    text = f"{label + ' ' if label else ''}{number} ({word} {lower_text}-{upper_text})"
    return ConditionResult(True, key, params, text) if matched else NO_MATCH


@callback
def _state_match(condition: Condition, state: State) -> ConditionResult:
    """Match when the state is (or is not) one of the listed values."""
    if not condition.states:
        return NO_MATCH
    contained = state.state in condition.states
    if contained is not condition.negate:
        listed = ", ".join(condition.states)
        key = "state_match_not" if condition.negate else "state_match"
        verb = "is not one of" if condition.negate else "is"
        return ConditionResult(
            True,
            key,
            {"state": state.state, "list": listed},
            f"state '{state.state}' {verb} {listed}",
        )
    return NO_MATCH


@callback
def _state_duration(condition: Condition, state: State) -> ConditionResult:
    """Match when the entity has held a given state for too long."""
    if condition.target_state is None or state.state != condition.target_state:
        return NO_MATCH
    age = (dt_util.utcnow() - state.last_changed).total_seconds()
    if age > condition.duration:
        age_text = format_duration(age)
        limit_text = format_duration(condition.duration)
        return ConditionResult(
            True,
            "state_duration",
            {"state": state.state, "age": age_text, "limit": limit_text},
            f"has been '{state.state}' for {age_text} (limit {limit_text})",
        )
    return NO_MATCH


def format_duration(seconds: float) -> str:
    """Render a duration in the largest sensible unit."""
    seconds = int(seconds)
    if seconds < 60:
        return f"{seconds}s"
    if seconds < 3600:
        return f"{seconds // 60}m"
    if seconds < 86400:
        return f"{seconds // 3600}h {(seconds % 3600) // 60}m"
    return f"{seconds // 86400}d {(seconds % 86400) // 3600}h"


def _with_unit(value: float, unit: str) -> str:
    """Render a number without a trailing '.0', with its unit appended."""
    number = f"{value:g}"
    return f"{number} {unit}" if unit else number
