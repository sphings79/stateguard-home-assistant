"""The bookkeeping that decides which entities exist.

Two bugs lived here: entities being added twice because adding them re-enters
the callback, and no entities being added at all because the "already known"
set was seeded from the registry. Both are cheap to guard against.
"""


def sync(known: set[str], current: set[str], registered: set[str]):
    """Mirror the platform's sync step.

    Returns what would be added and what would be removed from the registry.
    """
    added = current - known
    # Marked known *before* adding, because adding re-enters this callback.
    known.update(current)
    removed = {entry for entry in registered if entry not in current}
    known.intersection_update(current)
    return added, removed


def test_new_watches_are_added():
    """A watch that this run has not created yet gets an entity."""
    known: set[str] = set()

    added, removed = sync(known, {"w1", "w2"}, set())

    assert added == {"w1", "w2"}
    assert removed == set()
    assert known == {"w1", "w2"}


def test_a_second_pass_adds_nothing():
    """Re-entering the callback must not create duplicates."""
    known: set[str] = set()
    sync(known, {"w1"}, set())

    added, _ = sync(known, {"w1"}, {"w1"})

    assert added == set()


def test_entities_survive_a_restart():
    """After a restart nothing is known yet, so everything is created again.

    Seeding `known` from the registry instead would leave the entities
    registered but without an object behind them — they show as unavailable.
    """
    fresh_run: set[str] = set()

    added, removed = sync(fresh_run, {"w1", "w2"}, {"w1", "w2"})

    assert added == {"w1", "w2"}
    assert removed == set()


def test_orphans_are_removed_even_after_a_restart():
    """A watch deleted while the instance was down still gets cleaned up."""
    fresh_run: set[str] = set()

    added, removed = sync(fresh_run, {"w1"}, {"w1", "w_deleted"})

    assert added == {"w1"}
    assert removed == {"w_deleted"}


def test_deleting_a_watch_removes_its_entity():
    """Within one run, removing a watch removes its entity."""
    known: set[str] = set()
    sync(known, {"w1", "w2"}, set())

    added, removed = sync(known, {"w1"}, {"w1", "w2"})

    assert added == set()
    assert removed == {"w2"}
    assert known == {"w1"}
