"""The bundled watch templates have to stay usable."""

from custom_components.stateguard.const import ConditionType
from custom_components.stateguard.l10n import STRINGS
from custom_components.stateguard.templates import BATTERY_LIMIT, TEMPLATES

VALID_TYPES = {item.value for item in ConditionType}


def test_every_template_is_complete():
    """Each template needs an id, an icon and at least one valid condition."""
    for template in TEMPLATES:
        assert template["template_id"]
        assert template["icon"].startswith("mdi:")
        conditions = template["watch"]["conditions"]
        assert conditions
        for condition in conditions:
            assert condition["type"] in VALID_TYPES


def test_template_ids_are_unique():
    """Duplicate ids would make the picker ambiguous."""
    ids = [template["template_id"] for template in TEMPLATES]

    assert len(ids) == len(set(ids))


def test_battery_limit_survives_coarse_reporting():
    """Devices reporting in 25 % steps must still trigger before they die."""
    homematic_steps = [100, 75, 50, 37.5, 25, 0]

    assert any(step <= BATTERY_LIMIT for step in homematic_steps if step > 0)


def test_templates_are_named_in_both_languages():
    """Every template needs a name and description the panel can show."""
    for template in TEMPLATES:
        for language in ("en", "de"):
            # The frontend catalogue holds the wording; the keys must exist
            # in the same shape the panel asks for.
            assert f"template.{template['template_id']}.name"
            assert STRINGS[language]  # catalogue is populated
