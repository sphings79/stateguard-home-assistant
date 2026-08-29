"""The stored configuration must survive a round trip and tolerate old data."""

from custom_components.stateguard.models import (
    Channel,
    Condition,
    Config,
    Settings,
    Severity,
    Target,
    Watch,
)


def test_watch_from_partial_payload(watch_payload):
    """Missing keys fall back to their defaults instead of raising."""
    watch = Watch.from_dict(watch_payload)

    assert watch.id == "w1"
    assert watch.enabled is True
    assert watch.target.labels == ["battery"]
    assert watch.target.include_device_entities is True
    assert len(watch.conditions) == 1
    assert watch.conditions[0].type == "unavailable_state"
    assert watch.grace_period == 120


def test_unknown_keys_are_ignored(watch_payload):
    """A field from a newer or older version must not break loading."""
    watch = Watch.from_dict({**watch_payload, "something_new": 42})

    assert watch.name == "Availability"


def test_config_round_trip():
    """Serialising and reloading the configuration preserves it."""
    config = Config(
        watches=[Watch(id="w1", name="Test", severity_id="s1")],
        severities=[Severity(id="s1", name="Warning", priority=50)],
        channels=[Channel(id="c1", name="Mail", kind="smtp", config={"host": "x"})],
        settings=Settings(restart_grace_period=42),
    )

    restored = Config.from_dict(config.to_dict())

    assert restored.watches[0].name == "Test"
    assert restored.severities[0].priority == 50
    assert restored.channels[0].config["host"] == "x"
    assert restored.settings.restart_grace_period == 42


def test_config_lookups():
    """Watches and severities are found by their id."""
    config = Config(
        watches=[Watch(id="w1", name="A")],
        severities=[Severity(id="s1", name="Info")],
    )

    assert config.watch("w1").name == "A"
    assert config.watch("nope") is None
    assert config.severity("s1").name == "Info"


def test_empty_target_is_recognised():
    """A target selecting nothing is reported as empty."""
    assert Target().is_empty() is True
    assert Target(labels=["x"]).is_empty() is False
    assert Target(entities=["sensor.x"]).is_empty() is False


def test_condition_defaults():
    """A condition built from a bare type still has usable defaults."""
    condition = Condition.from_dict({"type": "stale"})

    assert condition.time_basis == "last_reported"
    assert condition.duration == 3600
