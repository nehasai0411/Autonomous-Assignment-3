"""Tests for Strategic Argumentation, Theorems 5.3 & 5.4, and Book Examples."""

import pytest
from backend.engine.framework import ArgumentationFramework
from backend.engine.strategic import MultiAgentArgumentation
from backend.engine.presets import PRESET_FRAMEWORKS


def test_example_5_10_and_misprint_correction():
    """Verify Example 5.10 from Rahwan & Larson (2009/2013).

    Framework:
    a1 -> a2 -> a3 -> a4
    and a3 -> a5
    Agent ownership:
    x: {a1, a4, a5}
    y: {a2}
    z: {a3}

    Book Misprint Note: In the book, the utilities of y and z were written with each other's
    argument sets.
    Correct truthfulness evaluation:
    - Grounded Extension: {a1, a3}
    - u_x = |{a1, a4, a5} cap {a1, a3}| = 1
    - u_y = |{a2} cap {a1, a3}| = 0
    - u_z = |{a3} cap {a1, a3}| = 1

    Strategic Hiding by Agent x:
    - Agent x hides a1, reporting only {a4, a5}.
    - Grounded Extension becomes {a2, a4, a5}.
    - u_x = |{a1, a4, a5} cap {a2, a4, a5}| = 2!
    - Agent x strictly increases utility from 1 to 2!
    - Hence, mechanism is NOT strategyproof.
    - Theorem 5.4 condition fails because path a1 -> a2 -> a3 -> a4 has length 3 (odd)
      and both a1, a4 in A_x.
    """
    preset = PRESET_FRAMEWORKS["example_5_10"]
    af = ArgumentationFramework(preset["arguments"], [tuple(att) for att in preset["attacks"]])
    ma = MultiAgentArgumentation(af, preset["agents"])

    # 1. Truthful reports evaluation
    truthful_reports = {"x": ["a1", "a4", "a5"], "y": ["a2"], "z": ["a3"]}
    ge_truthful, _ = ma.grounded_mechanism(truthful_reports)
    assert ge_truthful == {"a1", "a3"}

    utils_truthful = ma.compute_all_utilities(truthful_reports)
    assert utils_truthful["x"] == 1
    assert utils_truthful["y"] == 0  # y's argument a2 is defeated by a1
    assert utils_truthful["z"] == 1  # z's argument a3 is defended against a2

    # 2. Hiding report by agent x
    hiding_reports = {"x": ["a4", "a5"], "y": ["a2"], "z": ["a3"]}
    ge_hiding, _ = ma.grounded_mechanism(hiding_reports)
    assert ge_hiding == {"a2", "a4", "a5"}

    utils_hiding = ma.compute_all_utilities(hiding_reports)
    assert utils_hiding["x"] == 2  # Gained! 2 > 1
    assert utils_hiding["y"] == 1
    assert utils_hiding["z"] == 0

    # 3. Best reports evaluation for agent x against truthful y and z
    br_res = ma.get_best_reports("x", {"y": ["a2"], "z": ["a3"]})
    assert br_res["truthful_utility"] == 1
    assert br_res["max_utility"] == 2
    assert br_res["can_strictly_gain_by_hiding"] is True
    assert ["a4", "a5"] in br_res["best_reports"]

    # 4. Theorem 5.3 (Strategyproofness) fails
    t5_3 = ma.verify_theorem_5_3_strategyproofness()
    assert t5_3["is_strategyproof"] is False
    assert len(t5_3["counterexamples"]) > 0

    # 5. Theorem 5.4 (Odd-length path condition) fails
    t5_4 = ma.verify_theorem_5_4_condition()
    assert t5_4["satisfies_condition"] is False
    violating_pairs = {(v["source"], v["target"]) for v in t5_4["violating_pairs"]}
    assert ("a1", "a4") in violating_pairs
    assert ("a1", "a5") in violating_pairs

    # Check path length
    for v in t5_4["violating_pairs"]:
        if v["source"] == "a1" and v["target"] == "a4":
            assert v["path_length"] == 3
            assert v["path"] == ["a1", "a2", "a3", "a4"]


def test_example_5_11_and_non_necessity_of_t5_4():
    """Verify Example 5.11: variant of 5.10 with a6 defeating a3.

    Framework:
    Same attacks as 5.10 + (a6, a3).
    Agent ownership:
    x: {a1, a4, a5, a6}
    y: {a2}
    z: {a3}

    Key properties:
    - Path a1 -> a2 -> a3 -> a4 of length 3 STILL exists, so Theorem 5.4 condition FAILS!
    - However, revealing a6 neutralizes a3 directly.
    - Truthful grounded extension is {a1, a4, a5, a6}.
    - Utility of x is 4 (all of x's arguments).
    - Truthfulness is dominant: Theorem 5.3 strategyproofness HOLDS!
    - Proves: Theorem 5.4 is SUFFICIENT but NOT NECESSARY for strategyproofness.
    - Misprint note: The text erroneously named a5 instead of a6 as the canceling argument.
    """
    preset = PRESET_FRAMEWORKS["example_5_11"]
    af = ArgumentationFramework(preset["arguments"], [tuple(att) for att in preset["attacks"]])
    ma = MultiAgentArgumentation(af, preset["agents"])

    # 1. Truthful reports evaluation
    truthful_reports = {"x": ["a1", "a4", "a5", "a6"], "y": ["a2"], "z": ["a3"]}
    ge_truthful, _ = ma.grounded_mechanism(truthful_reports)
    assert ge_truthful == {"a1", "a4", "a5", "a6"}

    utils_truthful = ma.compute_all_utilities(truthful_reports)
    assert utils_truthful["x"] == 4
    assert utils_truthful["y"] == 0
    assert utils_truthful["z"] == 0

    # 2. Theorem 5.4 fails (non-necessity)
    t5_4 = ma.verify_theorem_5_4_condition()
    assert t5_4["satisfies_condition"] is False
    violating_pairs = {(v["source"], v["target"]) for v in t5_4["violating_pairs"]}
    assert ("a1", "a4") in violating_pairs

    # 3. Theorem 5.3 strategyproofness holds
    t5_3 = ma.verify_theorem_5_3_strategyproofness()
    assert t5_3["is_strategyproof"] is True
    assert len(t5_3["counterexamples"]) == 0

    # 4. Comparison category
    comp = ma.compare_theorems()
    assert comp["category"] == "T5.4 Failed & Strategyproof"


def test_cycles_handling_in_theorem_5_4():
    """Verify that BFS parity handles complex cycles without infinite loops.

    Graph with odd cycle (3-cycle): a -> b -> c -> a.
    And agent 1 owns all 3 arguments.
    Path from a to a of length 3 is odd!
    """
    af = ArgumentationFramework(["a", "b", "c"], [("a", "b"), ("b", "c"), ("c", "a")])
    ma = MultiAgentArgumentation(af, {"Agent_1": ["a", "b", "c"]})

    t5_4 = ma.verify_theorem_5_4_condition()
    assert t5_4["satisfies_condition"] is False
    # Path from a to a has length 3
    self_cycles = [v for v in t5_4["violating_pairs"] if v["source"] == v["target"]]
    assert len(self_cycles) >= 1
    assert self_cycles[0]["path_length"] == 3


def test_even_cycles_not_odd_violators():
    """Graph with pure even cycle: a -> b -> a, where Agent 1 owns only {a}.

    Length from a to a is 2 (even).
    Agent 1 only owns {a}, no odd self-path.
    Agent 2 owns {b}.
    Theorem 5.4 condition should satisfy for Agent 1 and Agent 2.
    """
    af = ArgumentationFramework(["a", "b"], [("a", "b"), ("b", "a")])
    ma = MultiAgentArgumentation(af, {"Agent_1": ["a"], "Agent_2": ["b"]})

    t5_4 = ma.verify_theorem_5_4_condition()
    assert t5_4["satisfies_condition"] is True
    assert len(t5_4["violating_pairs"]) == 0

    t5_3 = ma.verify_theorem_5_3_strategyproofness()
    assert t5_3["is_strategyproof"] is True


def test_sufficiency_guarantee():
    """Fundamental Theorem Sufficiency Test:

    If an instance satisfies Theorem 5.4, it MUST be strategyproof under Theorem 5.3.
    """
    from backend.engine.experiments import generate_random_instance, evaluate_single_instance
    import random

    rng = random.Random(12345)
    for _ in range(15):
        af, ownership = generate_random_instance(num_agents=3, num_args_range=(6, 7), p=0.2, rng=rng)
        res = evaluate_single_instance(af, ownership)
        if res["satisfies_theorem_5_4"]:
            assert res["is_strategyproof"] is True, "Sufficiency violated! Impossible mathematically!"
            assert res["category"] != "T5.4 Satisfied & Not Strategyproof"
