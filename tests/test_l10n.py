"""Both languages must offer the same keys, or the UI falls back silently."""

import re

from custom_components.stateguard.l10n import STRINGS, translate

PLACEHOLDER = re.compile(r"\{(\w+)\}")


def test_languages_have_the_same_keys():
    """A missing German key would quietly show English to a German user."""
    english = set(STRINGS["en"])
    german = set(STRINGS["de"])

    assert english - german == set()
    assert german - english == set()


def test_placeholders_match_between_languages():
    """A translated string must take the same values as the original."""
    for key, source in STRINGS["en"].items():
        expected = set(PLACEHOLDER.findall(source))
        actual = set(PLACEHOLDER.findall(STRINGS["de"][key]))
        assert actual == expected, f"placeholders differ for {key}"


def test_translate_fills_in_values():
    """Values are substituted into the string."""
    text = translate("de", "reason.unavailable_state", {"state": "unavailable"})

    assert "unavailable" in text
    assert "{state}" not in text


def test_translate_falls_back_to_english():
    """An unknown language still produces readable text."""
    assert translate("fr", "link.device") == STRINGS["en"]["link.device"]


def test_translate_returns_key_when_unknown():
    """An unknown key returns itself rather than raising."""
    assert translate("en", "nope.nothing") == "nope.nothing"


def test_translate_survives_missing_values():
    """A template asking for a value that was not supplied is not fatal."""
    assert translate("en", "reason.stale", {}) == STRINGS["en"]["reason.stale"]
