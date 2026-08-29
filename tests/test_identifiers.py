"""Identifiers for newly created objects.

A real bug lived here: the panel sends an empty id for a new object, and the
server used `setdefault`, which only fills a *missing* key. So every new watch
kept the empty id, and the next one found that same entry and overwrote it.
The first watch a user created was silently replaced by the second.
"""

from custom_components.stateguard.models import Channel, Severity, Watch, new_id


def assign_id(raw: dict) -> dict:
    """Mirror what the save handlers do before building the object."""
    if not raw.get("id"):
        raw["id"] = new_id()
    return raw


def test_missing_id_gets_one():
    """A payload without the key is treated as new."""
    result = assign_id({"name": "Availability"})

    assert result["id"]


def test_empty_id_gets_one():
    """An empty id is what the panel actually sends, and means "new"."""
    result = assign_id({"id": "", "name": "Availability"})

    assert result["id"] != ""


def test_existing_id_is_kept():
    """Saving an edit must update in place, not create a duplicate."""
    result = assign_id({"id": "abc123", "name": "Availability"})

    assert result["id"] == "abc123"


def test_two_new_objects_do_not_collide():
    """The regression itself: two saves in a row must be two objects."""
    first = assign_id({"id": "", "name": "First"})
    second = assign_id({"id": "", "name": "Second"})

    assert first["id"] != second["id"]


def test_identifiers_are_unique_across_many():
    """Ids are random, so check they do not repeat in practice."""
    ids = {new_id() for _ in range(1000)}

    assert len(ids) == 1000


def test_every_configurable_type_defaults_to_an_id():
    """Built directly, each type still ends up with an identifier."""
    assert Watch().id
    assert Severity().id
    assert Channel().id
