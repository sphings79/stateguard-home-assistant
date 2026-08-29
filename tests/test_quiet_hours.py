"""Quiet hours, including the awkward part: windows that cross midnight."""

from datetime import datetime, timedelta

import pytest

from custom_components.stateguard.models import Config, QuietWindow, Settings
from custom_components.stateguard.suppression import SuppressionEngine

MON, TUE, WED, THU, FRI, SAT, SUN = range(7)
WEEKDAYS = [MON, TUE, WED, THU, FRI]
WEEKEND = [SAT, SUN]


@pytest.fixture
def engine():
    """Return the suppression engine; the window check needs no Home Assistant."""
    return SuppressionEngine(None, 0.0)


# 2026-08-24 is a Monday, so weekday 0 lines up with the base date.
BASE = datetime(2026, 8, 24)


def at(day: int, hour: int, minute: int = 0) -> datetime:
    """Return a moment on a given weekday of that week."""
    return BASE + timedelta(days=day, hours=hour, minutes=minute)


def covers(engine, window: QuietWindow, moment: datetime) -> bool:
    """Ask whether a window is in force."""
    return engine._window_covers(window, moment)


def test_window_within_one_day(engine):
    """A window that does not cross midnight is simple."""
    window = QuietWindow(start="13:00", end="15:00", weekdays=[WED])

    assert covers(engine, window, at(WED, 14)) is True
    assert covers(engine, window, at(WED, 12)) is False
    assert covers(engine, window, at(WED, 15)) is False
    assert covers(engine, window, at(THU, 14)) is False


def test_window_across_midnight_belongs_to_its_start_day(engine):
    """Friday 23:00 to 07:00 must still be quiet early on Saturday."""
    window = QuietWindow(start="23:00", end="07:00", weekdays=[FRI])

    assert covers(engine, window, at(FRI, 23, 30)) is True
    assert covers(engine, window, at(SAT, 2)) is True
    assert covers(engine, window, at(SAT, 8)) is False
    # Saturday night is not covered — only Friday was selected.
    assert covers(engine, window, at(SAT, 23, 30)) is False


def test_weekday_and_weekend_windows_side_by_side(engine):
    """The case this exists for: different hours at the weekend."""
    week = QuietWindow(start="22:00", end="07:00", weekdays=WEEKDAYS)
    weekend = QuietWindow(start="01:00", end="09:00", weekdays=WEEKEND)

    # Tuesday half past ten at night: quiet by the weekday window.
    assert covers(engine, week, at(TUE, 22, 30)) is True
    assert covers(engine, weekend, at(TUE, 22, 30)) is False

    # Saturday at 23:00 you are still up — neither window applies.
    assert covers(engine, week, at(SAT, 23)) is False
    assert covers(engine, weekend, at(SAT, 23)) is False

    # Sunday at 03:00 the weekend window is in force.
    assert covers(engine, weekend, at(SUN, 3)) is True

    # Sunday at 08:00 still quiet at the weekend, but not on a weekday.
    assert covers(engine, weekend, at(SUN, 8)) is True
    assert covers(engine, week, at(SUN, 8)) is False


def test_disabled_quiet_hours_never_apply(engine):
    """The switch wins over every window."""
    config = Config(
        settings=Settings(
            quiet_hours=type(Settings().quiet_hours)(
                enabled=False,
                windows=[
                    QuietWindow(start="00:00", end="23:59", weekdays=list(range(7)))
                ],
            )
        )
    )

    assert engine.in_quiet_hours(config) is False


def test_broken_times_do_not_raise(engine):
    """A malformed time must not take the integration down."""
    window = QuietWindow(start="not a time", end="07:00", weekdays=[MON])

    assert covers(engine, window, at(MON, 3)) is False


def test_old_configuration_is_upgraded():
    """A stored single window keeps working after the update."""
    from custom_components.stateguard.models import QuietHours

    quiet = QuietHours.from_dict(
        {"enabled": True, "start": "23:00", "end": "06:00", "weekdays": [0, 1, 2]}
    )

    assert quiet.enabled is True
    assert len(quiet.windows) == 1
    assert quiet.windows[0].start == "23:00"
    assert quiet.windows[0].weekdays == [0, 1, 2]
