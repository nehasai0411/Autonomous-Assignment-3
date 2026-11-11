"""Unit and Property Tests for Dung's Argumentation Framework Engine."""

import pytest
from backend.engine.framework import ArgumentationFramework


def test_empty_framework():
    """Empty framework should have empty extensions and no crashes."""
    af = ArgumentationFramework([], [])
    assert af.is_conflict_free(set()) is True
    assert af.characteristic_function(set()) == set()
    assert af.is_admissible(set()) is True
    assert af.is_complete_extension(set()) is True

    grounded, log = af.get_grounded_extension()
    assert grounded == set()
    assert len(log) >= 1

    assert af.get_complete_extensions() == [set()]
    assert af.get_preferred_extensions() == [set()]
    assert af.get_stable_extensions() == [set()]
    assert af.get_semi_stable_extensions() == [set()]
    assert af.get_legal_labellings() == [{}]


def test_single_argument_no_attacks():
    """Single argument with no attacks is accepted everywhere."""
    af = ArgumentationFramework(["a"], [])
    assert af.is_conflict_free({"a"}) is True
    assert af.defends(set(), "a") is True
    assert af.characteristic_function(set()) == {"a"}

    grounded, _ = af.get_grounded_extension()
    assert grounded == {"a"}
    assert af.get_complete_extensions() == [{"a"}]
    assert af.get_preferred_extensions() == [{"a"}]
    assert af.get_stable_extensions() == [{"a"}]
    assert af.get_semi_stable_extensions() == [{"a"}]

    status = af.get_acceptance_status("a", "grounded")
    assert status["status"] == "skeptically_accepted"


def test_self_attack():
    """Self-attacking argument cannot be in any conflict-free set."""
    af = ArgumentationFramework(["s", "b"], [("s", "s"), ("s", "b")])
    assert af.is_conflict_free({"s"}) is False
    assert af.is_conflict_free({"b"}) is True
    # s is self-attacking so b has an attacker s that attacks itself, but can b be defended?
    # No, because no argument in {} attacks s. So b is not defended by {}.
    # Grounded extension is empty.
    grounded, _ = af.get_grounded_extension()
    assert grounded == set()

    # Complete extensions: only empty set
    complete = af.get_complete_extensions()
    assert complete == [set()]

    # Legal labellings:
    # If s is UNDEC, s has attacker s (UNDEC). b has attacker s (UNDEC), so b is UNDEC.
    labellings = af.get_legal_labellings()
    assert len(labellings) == 1
    assert labellings[0]["s"] == "UNDEC"
    assert labellings[0]["b"] == "UNDEC"


def test_two_cycle_mutual_attack():
    """a <-> b gives 3 complete extensions: {}, {a}, {b}."""
    af = ArgumentationFramework(["a", "b"], [("a", "b"), ("b", "a")])
    assert af.is_conflict_free({"a", "b"}) is False
    assert af.is_conflict_free({"a"}) is True
    assert af.is_conflict_free({"b"}) is True

    # Defends: {a} defends a because b attacks a, and a in {a} attacks b!
    assert af.defends({"a"}, "a") is True
    assert af.defends({"b"}, "b") is True

    grounded, _ = af.get_grounded_extension()
    assert grounded == set()

    complete = af.get_complete_extensions()
    assert len(complete) == 3
    assert set() in complete
    assert {"a"} in complete
    assert {"b"} in complete

    preferred = af.get_preferred_extensions()
    assert len(preferred) == 2
    assert {"a"} in preferred
    assert {"b"} in preferred

    stable = af.get_stable_extensions()
    assert len(stable) == 2
    assert {"a"} in stable
    assert {"b"} in stable

    # Acceptance statuses:
    # Under grounded, both are rejected
    assert af.get_acceptance_status("a", "grounded")["status"] == "rejected"
    # Under preferred, both are credulously accepted
    assert af.get_acceptance_status("a", "preferred")["status"] == "credulously_accepted"
    assert af.get_acceptance_status("b", "preferred")["status"] == "credulously_accepted"


def test_three_cycle_paradox():
    """3-cycle a -> b -> c -> a has no stable extension and only empty complete extension."""
    af = ArgumentationFramework(["a", "b", "c"], [("a", "b"), ("b", "c"), ("c", "a")])

    grounded, _ = af.get_grounded_extension()
    assert grounded == set()

    complete = af.get_complete_extensions()
    assert complete == [set()]

    preferred = af.get_preferred_extensions()
    assert preferred == [set()]

    # Stable extension does NOT exist
    stable = af.get_stable_extensions()
    assert stable == []

    # Semi-stable extension exists and is empty set
    semi_stable = af.get_semi_stable_extensions()
    assert semi_stable == [set()]


def test_semi_stable_semantics_distinction():
    """Verify semi-stable semantics when stable extensions do not exist.

    Consider graph: a <-> b (mutual attack) and an independent 3-cycle x -> y -> z -> x.
    Due to the 3-cycle, no complete extension can attack all arguments outside it,
    so no stable extensions exist.
    Complete extensions: {}, {a}, {b}.
    Range of {a} is {a, b}, range of {b} is {a, b}, range of {} is {}.
    The inclusion-maximal ranges among complete extensions are {a, b},
    so semi-stable extensions are {a} and {b}.
    """
    args = ["a", "b", "x", "y", "z"]
    attacks = [
        ("a", "b"), ("b", "a"),
        ("x", "y"), ("y", "z"), ("z", "x"),
    ]
    af = ArgumentationFramework(args, attacks)

    stable = af.get_stable_extensions()
    assert len(stable) == 0

    semi_stable = af.get_semi_stable_extensions()
    assert len(semi_stable) == 2
    assert {"a"} in semi_stable
    assert {"b"} in semi_stable


def test_soundness_extension_theorems():
    """Mathematical Theorems Verification on random test framework:

    1. Grounded extension is complete.
    2. Every preferred extension is complete.
    3. Every stable extension is complete and preferred.
    4. Every semi-stable extension is complete and preferred.
    """
    args = ["a", "b", "c", "d", "e"]
    attacks = [("a", "b"), ("b", "c"), ("c", "d"), ("d", "b"), ("e", "a")]
    af = ArgumentationFramework(args, attacks)

    grounded, _ = af.get_grounded_extension()
    complete = af.get_complete_extensions()
    preferred = af.get_preferred_extensions()
    stable = af.get_stable_extensions()
    semi_stable = af.get_semi_stable_extensions()

    # Grounded is in complete
    assert grounded in complete

    # Preferred are complete
    for p in preferred:
        assert p in complete

    # Stable are complete and preferred
    for s in stable:
        assert s in complete
        assert s in preferred

    # Semi-stable are complete and preferred
    for ss in semi_stable:
        assert ss in complete
        assert ss in preferred


def test_caminada_labellings_bijection():
    """Check bijection between complete extensions and legal labellings."""
    args = ["a", "b", "c", "d"]
    attacks = [("a", "b"), ("b", "c"), ("c", "d")]
    af = ArgumentationFramework(args, attacks)

    complete_exts = af.get_complete_extensions()
    labellings = af.get_legal_labellings()

    assert len(complete_exts) == len(labellings)

    for lab in labellings:
        in_nodes = {k for k, v in lab.items() if v == "IN"}
        assert in_nodes in complete_exts
        # Verify Caminada conditions:
        for node in args:
            node_label = lab[node]
            attackers = af.attackers_of(node)
            if node_label == "IN":
                assert all(lab[att] == "OUT" for att in attackers)
            elif node_label == "OUT":
                assert any(lab[att] == "IN" for att in attackers)
            else:
                assert not all(lab[att] == "OUT" for att in attackers)
                assert not any(lab[att] == "IN" for att in attackers)
