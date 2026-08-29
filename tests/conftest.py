"""Shared fixtures. The tests here cover logic that needs no running instance."""

from pathlib import Path
import sys

import pytest

# The integration is imported as `custom_components.stateguard`, matching how
# Home Assistant loads it.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


@pytest.fixture
def watch_payload() -> dict:
    """Return a watch as the panel sends it, with fields deliberately missing."""
    return {
        "id": "w1",
        "name": "Availability",
        "severity_id": "warning",
        "target": {"labels": ["battery"], "label_mode": "any"},
        "conditions": [{"type": "unavailable_state", "states": ["unavailable"]}],
        "grace_period": 120,
    }
