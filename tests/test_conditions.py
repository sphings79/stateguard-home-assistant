"""Condition evaluation — the part that decides whether something is wrong."""

from datetime import timedelta

from homeassistant.core import State
from homeassistant.util import dt as dt_util
import pytest

from custom_components.stateguard.conditions import evaluate
from custom_components.stateguard.models import Condition


class FakeStates:
    """Just enough of the state machine for the condition checks."""

    def __init__(self, states: dict[str, State]) -> None:
        self._states = states

    def get(self, entity_id: str) -> State | None:
        return self._states.get(entity_id)


class FakeHass:
    """Stands in for Home Assistant; conditions only read states."""

    def __init__(self, *states: State) -> None:
        self.states = FakeStates({state.entity_id: state for state in states})


def make_state(
    entity_id: str = "sensor.test",
    value: str = "42",
    *,
    reported_ago: int = 0,
    changed_ago: int = 0,
    attributes: dict | None = None,
) -> State:
    """Build a state with ages measured backwards from now."""
    now = dt_util.utcnow()
    return State(
        entity_id,
        value,
        attributes or {},
        last_changed=now - timedelta(seconds=changed_ago),
        last_reported=now - timedelta(seconds=reported_ago),
        last_updated=now - timedelta(seconds=reported_ago),
    )


@pytest.mark.parametrize("value", ["unavailable", "unknown"])
def test_unavailable_state_matches(value):
    """The default bad states are recognised."""
    hass = FakeHass(make_state(value=value))
    result = evaluate(hass, Condition(type="unavailable_state"), "sensor.test")

    assert result.matched is True
    assert result.key == "unavailable_state"
    assert result.params["state"] == value


def test_unavailable_state_ignores_a_healthy_entity():
    """A normal reading is not a problem."""
    hass = FakeHass(make_state(value="21.5"))
    result = evaluate(hass, Condition(type="unavailable_state"), "sensor.test")

    assert result.matched is False


def test_stale_uses_last_reported():
    """A device repeating the same value is not stale as long as it reports."""
    condition = Condition(type="stale", duration=3600, time_basis="last_reported")

    quiet = FakeHass(make_state(reported_ago=7200, changed_ago=7200))
    assert evaluate(quiet, condition, "sensor.test").matched is True

    # Same value for two hours, but reported a minute ago: healthy.
    chatty = FakeHass(make_state(reported_ago=60, changed_ago=7200))
    assert evaluate(chatty, condition, "sensor.test").matched is False


def test_stale_can_measure_last_changed_instead():
    """The other time bases stay available for entities that need them."""
    condition = Condition(type="stale", duration=3600, time_basis="last_changed")
    hass = FakeHass(make_state(reported_ago=60, changed_ago=7200))

    assert evaluate(hass, condition, "sensor.test").matched is True


def test_numeric_threshold_reports_value_and_unit():
    """The reason carries a readable value, not a bare comparison."""
    condition = Condition(
        type="numeric_threshold", operator="le", value=25, source="state"
    )
    hass = FakeHass(make_state(value="10", attributes={"unit_of_measurement": "%"}))

    result = evaluate(hass, condition, "sensor.test")

    assert result.matched is True
    assert result.key == "numeric_below"
    assert result.params["value"] == "10 %"
    assert result.params["limit"] == "25 %"


def test_numeric_threshold_hysteresis():
    """Once a problem is active, the recovery value decides when it clears."""
    condition = Condition(
        type="numeric_threshold", operator="le", value=25, recovery_value=40
    )

    # 30 is above the limit, so on its own it is fine.
    hass = FakeHass(make_state(value="30"))
    assert evaluate(hass, condition, "sensor.test").matched is False

    # While a problem stands, 30 is still below the recovery value.
    result = evaluate(hass, condition, "sensor.test", was_matching=True)
    assert result.matched is True
    # The reason quotes the configured limit, not the recovery value.
    assert result.params["limit"] == "25"

    # Past the recovery value it clears.
    recovered = FakeHass(make_state(value="45"))
    assert (
        evaluate(recovered, condition, "sensor.test", was_matching=True).matched
        is False
    )


def test_numeric_threshold_reads_an_attribute():
    """Values living in an attribute are supported."""
    condition = Condition(
        type="numeric_threshold", operator="lt", value=20, source="battery_level"
    )
    hass = FakeHass(make_state(value="on", attributes={"battery_level": 5}))

    result = evaluate(hass, condition, "sensor.test")

    assert result.matched is True
    assert result.params["attribute"] == "battery_level"


def test_numeric_threshold_ignores_non_numeric_states():
    """An unavailable entity must not be read as a number."""
    condition = Condition(type="numeric_threshold", operator="lt", value=20)
    hass = FakeHass(make_state(value="unavailable"))

    assert evaluate(hass, condition, "sensor.test").matched is False


def test_state_match_and_negation():
    """Both directions of the state comparison work."""
    hass = FakeHass(make_state(value="unlocked"))

    positive = Condition(type="state_match", states=["unlocked"])
    assert evaluate(hass, positive, "sensor.test").matched is True

    negative = Condition(type="state_match", states=["locked"], negate=True)
    assert evaluate(hass, negative, "sensor.test").matched is True

    quiet = Condition(type="state_match", states=["locked"])
    assert evaluate(hass, quiet, "sensor.test").matched is False


def test_state_duration_needs_both_state_and_time():
    """The state has to match and have lasted long enough."""
    condition = Condition(type="state_duration", target_state="unlocked", duration=600)

    fresh = FakeHass(make_state(value="unlocked", changed_ago=60))
    assert evaluate(fresh, condition, "sensor.test").matched is False

    stuck = FakeHass(make_state(value="unlocked", changed_ago=1200))
    assert evaluate(stuck, condition, "sensor.test").matched is True

    other = FakeHass(make_state(value="locked", changed_ago=1200))
    assert evaluate(other, condition, "sensor.test").matched is False


def test_entity_missing_only_fires_without_a_state():
    """A missing entity is a problem only where the watch asks for it."""
    condition = Condition(type="entity_missing")

    assert evaluate(FakeHass(), condition, "sensor.gone").matched is True
    assert evaluate(FakeHass(make_state()), condition, "sensor.test").matched is False


def test_other_conditions_ignore_a_missing_entity():
    """Without a state there is nothing for the other checks to look at."""
    hass = FakeHass()

    for condition in (
        Condition(type="unavailable_state"),
        Condition(type="stale", duration=1),
        Condition(type="numeric_threshold", operator="lt", value=1),
        Condition(type="state_match", states=["x"]),
        Condition(type="state_duration", target_state="x", duration=1),
    ):
        assert evaluate(hass, condition, "sensor.gone").matched is False
