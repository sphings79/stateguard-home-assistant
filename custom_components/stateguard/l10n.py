"""Translations for text that Home Assistant shows the user from Python.

Entity names and services are translated by Home Assistant itself through
`strings.json`. Notification bodies are assembled at runtime from a condition
result, which that mechanism does not cover, so they live here. The keys match
the frontend catalogue so both render a problem the same way.
"""

from __future__ import annotations

from typing import Final

STRINGS: Final[dict[str, dict[str, str]]] = {
    "en": {
        "title.problem": "Problem",
        "title.escalated": "Escalated",
        "title.cleared": "Resolved",
        "reason.unavailable_state": "state is “{state}”",
        "reason.stale": "no report for {age} (limit {limit})",
        "reason.numeric_below": "{value} (below {limit})",
        "reason.numeric_above": "{value} (above {limit})",
        "reason.numeric_below_attribute": "{attribute}: {value} (below {limit})",
        "reason.numeric_above_attribute": "{attribute}: {value} (above {limit})",
        "reason.numeric_outside": "{value} (outside {lower}–{upper})",
        "reason.numeric_inside": "{value} (inside {lower}–{upper})",
        "reason.numeric_outside_attribute": (
            "{attribute}: {value} (outside {lower}–{upper})"
        ),
        "reason.numeric_inside_attribute": (
            "{attribute}: {value} (inside {lower}–{upper})"
        ),
        "reason.state_match": "state “{state}” is one of {list}",
        "reason.state_match_not": "state “{state}” is none of {list}",
        "reason.state_duration": "has been “{state}” for {age} (limit {limit})",
        "reason.entity_missing": "entity no longer exists",
        "link.history": "History",
        "link.device": "Device",
        "link.integration": "Integration",
        "test.title": "StateGuard test message",
        "test.body": "If you are reading this, the channel works.",
        "template.title": "{{ severity }}: {{ watch }}",
        "template.escalated_title": "Escalated — {{ severity }}: {{ watch }}",
        "template.clear_title": "Resolved: {{ watch }}",
        "template.body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}): {{ p.reason }}\n"
            "{% if p.url %}  {{ p.url }}\n{% endif %}"
            "{% endfor %}"
        ),
        "template.clear_body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}) is back to normal.\n"
            "{% endfor %}"
        ),
    },
    "de": {
        "title.problem": "Problem",
        "title.escalated": "Eskaliert",
        "title.cleared": "Behoben",
        "reason.unavailable_state": "Zustand ist „{state}“",
        "reason.stale": "seit {age} keine Meldung (Grenze {limit})",
        "reason.numeric_below": "{value} (unter {limit})",
        "reason.numeric_above": "{value} (über {limit})",
        "reason.numeric_below_attribute": "{attribute}: {value} (unter {limit})",
        "reason.numeric_above_attribute": "{attribute}: {value} (über {limit})",
        "reason.numeric_outside": "{value} (außerhalb {lower}–{upper})",
        "reason.numeric_inside": "{value} (innerhalb {lower}–{upper})",
        "reason.numeric_outside_attribute": (
            "{attribute}: {value} (außerhalb {lower}–{upper})"
        ),
        "reason.numeric_inside_attribute": (
            "{attribute}: {value} (innerhalb {lower}–{upper})"
        ),
        "reason.state_match": "Zustand „{state}“ ist einer von {list}",
        "reason.state_match_not": "Zustand „{state}“ ist keiner von {list}",
        "reason.state_duration": "seit {age} „{state}“ (Grenze {limit})",
        "reason.entity_missing": "Entität existiert nicht mehr",
        "link.history": "Verlauf",
        "link.device": "Gerät",
        "link.integration": "Integration",
        "test.title": "StateGuard-Testnachricht",
        "test.body": "Wenn du das liest, funktioniert der Kanal.",
        "template.title": "{{ severity }}: {{ watch }}",
        "template.escalated_title": "Eskaliert — {{ severity }}: {{ watch }}",
        "template.clear_title": "Behoben: {{ watch }}",
        "template.body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}): {{ p.reason }}\n"
            "{% if p.url %}  {{ p.url }}\n{% endif %}"
            "{% endfor %}"
        ),
        "template.clear_body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}) ist wieder in Ordnung.\n"
            "{% endfor %}"
        ),
    },
}


def translate(language: str, key: str, params: dict[str, str] | None = None) -> str:
    """Return the string for a key, falling back to English and then the key."""
    table = STRINGS.get((language or "en").split("-")[0], STRINGS["en"])
    text = table.get(key) or STRINGS["en"].get(key) or key
    if not params:
        return text
    try:
        return text.format(**params)
    except (KeyError, IndexError):
        return text
