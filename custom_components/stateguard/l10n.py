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
    "nl": {
        "title.problem": "Probleem",
        "title.escalated": "Geëscaleerd",
        "title.cleared": "Opgelost",
        "reason.unavailable_state": "status is “{state}”",
        "reason.stale": "al {age} geen melding (grens {limit})",
        "reason.numeric_below": "{value} (onder {limit})",
        "reason.numeric_above": "{value} (boven {limit})",
        "reason.numeric_below_attribute": "{attribute}: {value} (onder {limit})",
        "reason.numeric_above_attribute": "{attribute}: {value} (boven {limit})",
        "reason.numeric_outside": "{value} (buiten {lower}–{upper})",
        "reason.numeric_inside": "{value} (binnen {lower}–{upper})",
        "reason.numeric_outside_attribute": (
            "{attribute}: {value} (buiten {lower}–{upper})"
        ),
        "reason.numeric_inside_attribute": (
            "{attribute}: {value} (binnen {lower}–{upper})"
        ),
        "reason.state_match": "status “{state}” is er een van {list}",
        "reason.state_match_not": "status “{state}” is geen van {list}",
        "reason.state_duration": "al {age} “{state}” (grens {limit})",
        "reason.entity_missing": "entiteit bestaat niet meer",
        "link.history": "Geschiedenis",
        "link.device": "Apparaat",
        "link.integration": "Integratie",
        "test.title": "StateGuard-testbericht",
        "test.body": "Als je dit leest, werkt het kanaal.",
        "template.title": "{{ severity }}: {{ watch }}",
        "template.escalated_title": "Geëscaleerd — {{ severity }}: {{ watch }}",
        "template.clear_title": "Opgelost: {{ watch }}",
        "template.body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}): {{ p.reason }}\n"
            "{% if p.url %}  {{ p.url }}\n{% endif %}"
            "{% endfor %}"
        ),
        "template.clear_body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}) is weer in orde.\n"
            "{% endfor %}"
        ),
    },
    "fr": {
        "title.problem": "Problème",
        "title.escalated": "Escaladé",
        "title.cleared": "Résolu",
        "reason.unavailable_state": "l’état est « {state} »",
        "reason.stale": "aucun signalement depuis {age} (limite {limit})",
        "reason.numeric_below": "{value} (sous {limit})",
        "reason.numeric_above": "{value} (au-dessus de {limit})",
        "reason.numeric_below_attribute": "{attribute} : {value} (sous {limit})",
        "reason.numeric_above_attribute": (
            "{attribute} : {value} (au-dessus de {limit})"
        ),
        "reason.numeric_outside": "{value} (hors de {lower}–{upper})",
        "reason.numeric_inside": "{value} (dans {lower}–{upper})",
        "reason.numeric_outside_attribute": (
            "{attribute} : {value} (hors de {lower}–{upper})"
        ),
        "reason.numeric_inside_attribute": (
            "{attribute} : {value} (dans {lower}–{upper})"
        ),
        "reason.state_match": "l’état « {state} » fait partie de {list}",
        "reason.state_match_not": "l’état « {state} » ne fait pas partie de {list}",
        "reason.state_duration": "« {state} » depuis {age} (limite {limit})",
        "reason.entity_missing": "l’entité n’existe plus",
        "link.history": "Historique",
        "link.device": "Appareil",
        "link.integration": "Intégration",
        "test.title": "Message de test StateGuard",
        "test.body": "Si vous lisez ceci, le canal fonctionne.",
        "template.title": "{{ severity }}: {{ watch }}",
        "template.escalated_title": "Escaladé — {{ severity }}: {{ watch }}",
        "template.clear_title": "Résolu : {{ watch }}",
        "template.body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}): {{ p.reason }}\n"
            "{% if p.url %}  {{ p.url }}\n{% endif %}"
            "{% endfor %}"
        ),
        "template.clear_body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}) est de nouveau en ordre.\n"
            "{% endfor %}"
        ),
    },
    "es": {
        "title.problem": "Problema",
        "title.escalated": "Escalado",
        "title.cleared": "Resuelto",
        "reason.unavailable_state": "el estado es «{state}»",
        "reason.stale": "sin datos desde hace {age} (límite {limit})",
        "reason.numeric_below": "{value} (por debajo de {limit})",
        "reason.numeric_above": "{value} (por encima de {limit})",
        "reason.numeric_below_attribute": (
            "{attribute}: {value} (por debajo de {limit})"
        ),
        "reason.numeric_above_attribute": (
            "{attribute}: {value} (por encima de {limit})"
        ),
        "reason.numeric_outside": "{value} (fuera de {lower}–{upper})",
        "reason.numeric_inside": "{value} (dentro de {lower}–{upper})",
        "reason.numeric_outside_attribute": (
            "{attribute}: {value} (fuera de {lower}–{upper})"
        ),
        "reason.numeric_inside_attribute": (
            "{attribute}: {value} (dentro de {lower}–{upper})"
        ),
        "reason.state_match": "el estado «{state}» es uno de {list}",
        "reason.state_match_not": "el estado «{state}» no es ninguno de {list}",
        "reason.state_duration": "lleva {age} en «{state}» (límite {limit})",
        "reason.entity_missing": "la entidad ya no existe",
        "link.history": "Historial",
        "link.device": "Dispositivo",
        "link.integration": "Integración",
        "test.title": "Mensaje de prueba de StateGuard",
        "test.body": "Si estás leyendo esto, el canal funciona.",
        "template.title": "{{ severity }}: {{ watch }}",
        "template.escalated_title": "Escalado — {{ severity }}: {{ watch }}",
        "template.clear_title": "Resuelto: {{ watch }}",
        "template.body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}): {{ p.reason }}\n"
            "{% if p.url %}  {{ p.url }}\n{% endif %}"
            "{% endfor %}"
        ),
        "template.clear_body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}) vuelve a estar correcta.\n"
            "{% endfor %}"
        ),
    },
    "it": {
        "title.problem": "Problema",
        "title.escalated": "In escalation",
        "title.cleared": "Risolto",
        "reason.unavailable_state": "lo stato è «{state}»",
        "reason.stale": "nessuna segnalazione da {age} (limite {limit})",
        "reason.numeric_below": "{value} (sotto {limit})",
        "reason.numeric_above": "{value} (sopra {limit})",
        "reason.numeric_below_attribute": "{attribute}: {value} (sotto {limit})",
        "reason.numeric_above_attribute": "{attribute}: {value} (sopra {limit})",
        "reason.numeric_outside": "{value} (fuori da {lower}–{upper})",
        "reason.numeric_inside": "{value} (dentro {lower}–{upper})",
        "reason.numeric_outside_attribute": (
            "{attribute}: {value} (fuori da {lower}–{upper})"
        ),
        "reason.numeric_inside_attribute": (
            "{attribute}: {value} (dentro {lower}–{upper})"
        ),
        "reason.state_match": "lo stato «{state}» è uno fra {list}",
        "reason.state_match_not": "lo stato «{state}» non è nessuno fra {list}",
        "reason.state_duration": "è «{state}» da {age} (limite {limit})",
        "reason.entity_missing": "l’entità non esiste più",
        "link.history": "Cronologia",
        "link.device": "Dispositivo",
        "link.integration": "Integrazione",
        "test.title": "Messaggio di prova di StateGuard",
        "test.body": "Se stai leggendo questo, il canale funziona.",
        "template.title": "{{ severity }}: {{ watch }}",
        "template.escalated_title": "In escalation — {{ severity }}: {{ watch }}",
        "template.clear_title": "Risolto: {{ watch }}",
        "template.body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}): {{ p.reason }}\n"
            "{% if p.url %}  {{ p.url }}\n{% endif %}"
            "{% endfor %}"
        ),
        "template.clear_body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}) è di nuovo a posto.\n"
            "{% endfor %}"
        ),
    },
    "pl": {
        "title.problem": "Problem",
        "title.escalated": "Eskalacja",
        "title.cleared": "Rozwiązano",
        "reason.unavailable_state": "stan to „{state}”",
        "reason.stale": "brak zgłoszeń od {age} (limit {limit})",
        "reason.numeric_below": "{value} (poniżej {limit})",
        "reason.numeric_above": "{value} (powyżej {limit})",
        "reason.numeric_below_attribute": "{attribute}: {value} (poniżej {limit})",
        "reason.numeric_above_attribute": "{attribute}: {value} (powyżej {limit})",
        "reason.numeric_outside": "{value} (poza {lower}–{upper})",
        "reason.numeric_inside": "{value} (w zakresie {lower}–{upper})",
        "reason.numeric_outside_attribute": (
            "{attribute}: {value} (poza {lower}–{upper})"
        ),
        "reason.numeric_inside_attribute": (
            "{attribute}: {value} (w zakresie {lower}–{upper})"
        ),
        "reason.state_match": "stan „{state}” jest jednym z {list}",
        "reason.state_match_not": "stan „{state}” nie jest żadnym z {list}",
        "reason.state_duration": "od {age} w stanie „{state}” (limit {limit})",
        "reason.entity_missing": "encja już nie istnieje",
        "link.history": "Historia",
        "link.device": "Urządzenie",
        "link.integration": "Integracja",
        "test.title": "Wiadomość testowa StateGuard",
        "test.body": "Jeśli to czytasz, kanał działa.",
        "template.title": "{{ severity }}: {{ watch }}",
        "template.escalated_title": "Eskalacja — {{ severity }}: {{ watch }}",
        "template.clear_title": "Rozwiązano: {{ watch }}",
        "template.body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}): {{ p.reason }}\n"
            "{% if p.url %}  {{ p.url }}\n{% endif %}"
            "{% endfor %}"
        ),
        "template.clear_body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}) jest znów w porządku.\n"
            "{% endfor %}"
        ),
    },
    "da": {
        "title.problem": "Problem",
        "title.escalated": "Eskaleret",
        "title.cleared": "Løst",
        "reason.unavailable_state": "tilstanden er “{state}”",
        "reason.stale": "ingen melding i {age} (grænse {limit})",
        "reason.numeric_below": "{value} (under {limit})",
        "reason.numeric_above": "{value} (over {limit})",
        "reason.numeric_below_attribute": "{attribute}: {value} (under {limit})",
        "reason.numeric_above_attribute": "{attribute}: {value} (over {limit})",
        "reason.numeric_outside": "{value} (uden for {lower}–{upper})",
        "reason.numeric_inside": "{value} (inden for {lower}–{upper})",
        "reason.numeric_outside_attribute": (
            "{attribute}: {value} (uden for {lower}–{upper})"
        ),
        "reason.numeric_inside_attribute": (
            "{attribute}: {value} (inden for {lower}–{upper})"
        ),
        "reason.state_match": "tilstanden “{state}” er en af {list}",
        "reason.state_match_not": "tilstanden “{state}” er ingen af {list}",
        "reason.state_duration": "har været “{state}” i {age} (grænse {limit})",
        "reason.entity_missing": "entiteten findes ikke længere",
        "link.history": "Historik",
        "link.device": "Enhed",
        "link.integration": "Integration",
        "test.title": "StateGuard-testbesked",
        "test.body": "Hvis du læser dette, virker kanalen.",
        "template.title": "{{ severity }}: {{ watch }}",
        "template.escalated_title": "Eskaleret — {{ severity }}: {{ watch }}",
        "template.clear_title": "Løst: {{ watch }}",
        "template.body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}): {{ p.reason }}\n"
            "{% if p.url %}  {{ p.url }}\n{% endif %}"
            "{% endfor %}"
        ),
        "template.clear_body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}) er i orden igen.\n"
            "{% endfor %}"
        ),
    },
    "sv": {
        "title.problem": "Problem",
        "title.escalated": "Eskalerat",
        "title.cleared": "Löst",
        "reason.unavailable_state": "tillståndet är ”{state}”",
        "reason.stale": "ingen rapport på {age} (gräns {limit})",
        "reason.numeric_below": "{value} (under {limit})",
        "reason.numeric_above": "{value} (över {limit})",
        "reason.numeric_below_attribute": "{attribute}: {value} (under {limit})",
        "reason.numeric_above_attribute": "{attribute}: {value} (över {limit})",
        "reason.numeric_outside": "{value} (utanför {lower}–{upper})",
        "reason.numeric_inside": "{value} (inom {lower}–{upper})",
        "reason.numeric_outside_attribute": (
            "{attribute}: {value} (utanför {lower}–{upper})"
        ),
        "reason.numeric_inside_attribute": (
            "{attribute}: {value} (inom {lower}–{upper})"
        ),
        "reason.state_match": "tillståndet ”{state}” är ett av {list}",
        "reason.state_match_not": "tillståndet ”{state}” är inget av {list}",
        "reason.state_duration": "har varit ”{state}” i {age} (gräns {limit})",
        "reason.entity_missing": "entiteten finns inte längre",
        "link.history": "Historik",
        "link.device": "Enhet",
        "link.integration": "Integration",
        "test.title": "StateGuard-testmeddelande",
        "test.body": "Läser du det här fungerar kanalen.",
        "template.title": "{{ severity }}: {{ watch }}",
        "template.escalated_title": "Eskalerat — {{ severity }}: {{ watch }}",
        "template.clear_title": "Löst: {{ watch }}",
        "template.body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}): {{ p.reason }}\n"
            "{% if p.url %}  {{ p.url }}\n{% endif %}"
            "{% endfor %}"
        ),
        "template.clear_body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}) är i sin ordning igen.\n"
            "{% endfor %}"
        ),
    },
    "cs": {
        "title.problem": "Problém",
        "title.escalated": "Eskalováno",
        "title.cleared": "Vyřešeno",
        "reason.unavailable_state": "stav je „{state}“",
        "reason.stale": "bez hlášení už {age} (limit {limit})",
        "reason.numeric_below": "{value} (pod {limit})",
        "reason.numeric_above": "{value} (nad {limit})",
        "reason.numeric_below_attribute": "{attribute}: {value} (pod {limit})",
        "reason.numeric_above_attribute": "{attribute}: {value} (nad {limit})",
        "reason.numeric_outside": "{value} (mimo {lower}–{upper})",
        "reason.numeric_inside": "{value} (v rozmezí {lower}–{upper})",
        "reason.numeric_outside_attribute": (
            "{attribute}: {value} (mimo {lower}–{upper})"
        ),
        "reason.numeric_inside_attribute": (
            "{attribute}: {value} (v rozmezí {lower}–{upper})"
        ),
        "reason.state_match": "stav „{state}“ je jedním z {list}",
        "reason.state_match_not": "stav „{state}“ není žádný z {list}",
        "reason.state_duration": "je „{state}“ už {age} (limit {limit})",
        "reason.entity_missing": "entita už neexistuje",
        "link.history": "Historie",
        "link.device": "Zařízení",
        "link.integration": "Integrace",
        "test.title": "Testovací zpráva StateGuard",
        "test.body": "Pokud tohle čtete, kanál funguje.",
        "template.title": "{{ severity }}: {{ watch }}",
        "template.escalated_title": "Eskalováno — {{ severity }}: {{ watch }}",
        "template.clear_title": "Vyřešeno: {{ watch }}",
        "template.body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}): {{ p.reason }}\n"
            "{% if p.url %}  {{ p.url }}\n{% endif %}"
            "{% endfor %}"
        ),
        "template.clear_body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}) je zase v pořádku.\n"
            "{% endfor %}"
        ),
    },
    "pt": {
        "title.problem": "Problema",
        "title.escalated": "Escalonado",
        "title.cleared": "Resolvido",
        "reason.unavailable_state": "o estado é «{state}»",
        "reason.stale": "sem comunicação há {age} (limite {limit})",
        "reason.numeric_below": "{value} (abaixo de {limit})",
        "reason.numeric_above": "{value} (acima de {limit})",
        "reason.numeric_below_attribute": "{attribute}: {value} (abaixo de {limit})",
        "reason.numeric_above_attribute": "{attribute}: {value} (acima de {limit})",
        "reason.numeric_outside": "{value} (fora de {lower}–{upper})",
        "reason.numeric_inside": "{value} (dentro de {lower}–{upper})",
        "reason.numeric_outside_attribute": (
            "{attribute}: {value} (fora de {lower}–{upper})"
        ),
        "reason.numeric_inside_attribute": (
            "{attribute}: {value} (dentro de {lower}–{upper})"
        ),
        "reason.state_match": "o estado «{state}» é um de {list}",
        "reason.state_match_not": "o estado «{state}» não é nenhum de {list}",
        "reason.state_duration": "está «{state}» há {age} (limite {limit})",
        "reason.entity_missing": "a entidade já não existe",
        "link.history": "Histórico",
        "link.device": "Dispositivo",
        "link.integration": "Integração",
        "test.title": "Mensagem de teste do StateGuard",
        "test.body": "Se está a ler isto, o canal funciona.",
        "template.title": "{{ severity }}: {{ watch }}",
        "template.escalated_title": "Escalonado — {{ severity }}: {{ watch }}",
        "template.clear_title": "Resolvido: {{ watch }}",
        "template.body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}): {{ p.reason }}\n"
            "{% if p.url %}  {{ p.url }}\n{% endif %}"
            "{% endfor %}"
        ),
        "template.clear_body": (
            "{% for p in problems %}"
            "\u2022 {{ p.name }} ({{ p.entity_id }}) está novamente em ordem.\n"
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
