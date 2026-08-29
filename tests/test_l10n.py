"""Both languages must offer the same keys, or the UI falls back silently."""

import re

from custom_components.stateguard.l10n import STRINGS, translate

PLACEHOLDER = re.compile(r"\{(\w+)\}")


def test_every_language_has_the_same_keys():
    """A missing key would quietly show English to someone expecting their own."""
    english = set(STRINGS["en"])

    for code, catalogue in STRINGS.items():
        assert set(catalogue) == english, f"keys differ for {code}"


def test_placeholders_match_between_languages():
    """A translated string must take the same values as the original."""
    for code, catalogue in STRINGS.items():
        for key, source in STRINGS["en"].items():
            expected = set(PLACEHOLDER.findall(source))
            actual = set(PLACEHOLDER.findall(catalogue[key]))
            assert actual == expected, f"placeholders differ for {code}/{key}"


def test_no_language_is_empty():
    """An empty string would render as nothing at all in the interface."""
    for code, catalogue in STRINGS.items():
        for key, value in catalogue.items():
            assert value.strip(), f"{code}/{key} is empty"


def test_translate_fills_in_values():
    """Values are substituted into the string."""
    text = translate("de", "reason.unavailable_state", {"state": "unavailable"})

    assert "unavailable" in text
    assert "{state}" not in text


def test_translate_falls_back_to_english():
    """An unknown language still produces readable text."""
    assert translate("ja", "link.device") == STRINGS["en"]["link.device"]


def test_regional_codes_resolve_to_their_base_language():
    """Home Assistant hands out codes like "de-CH"."""
    assert translate("de-CH", "title.problem") == STRINGS["de"]["title.problem"]
    assert translate("pt-BR", "title.problem") == STRINGS["pt"]["title.problem"]


def test_translate_returns_key_when_unknown():
    """An unknown key returns itself rather than raising."""
    assert translate("en", "nope.nothing") == "nope.nothing"


def test_translate_survives_missing_values():
    """A template asking for a value that was not supplied is not fatal."""
    assert translate("en", "reason.stale", {}) == STRINGS["en"]["reason.stale"]
