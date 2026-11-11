"""Predefined argumentation frameworks and benchmark instances.

Includes the prescribed textbook examples (Example 5.10 and Example 5.11 with misprints corrected)
as well as standard benchmark frameworks.
"""

from typing import Any, Dict

PRESET_FRAMEWORKS: Dict[str, Dict[str, Any]] = {
    "example_5_10": {
        "id": "example_5_10",
        "name": "Example 5.10 (Rahwan & Larson)",
        "description": (
            "Classic indirect self-defeat example. Agent x owns {a1, a4, a5}, y owns {a2}, z owns {a3}. "
            "Attacks: a1->a2, a2->a3, a3->a4, a3->a5. "
            "An odd-length path (length 3) exists from a1 to a4 and a5. "
            "Under full truthfulness, Grounded Extension is {a1, a3}, so u_x = 1 (only a1 accepted). "
            "If agent x strategically hides a1, Grounded Extension becomes {a2, a4, a5}, so u_x = 2! "
            "Hence, the mechanism is NOT strategyproof. "
            "[Book Misprint Note: In the book, the utilities of y and z were inadvertently swapped with each other's argument sets]."
        ),
        "arguments": ["a1", "a2", "a3", "a4", "a5"],
        "attacks": [["a1", "a2"], ["a2", "a3"], ["a3", "a4"], ["a3", "a5"]],
        "agents": {
            "x": ["a1", "a4", "a5"],
            "y": ["a2"],
            "z": ["a3"],
        },
        "misprint_notes": (
            "In Example 5.10 in the book, the utilities of y and z are written with each other's argument sets. "
            "Correct utilities under truthfulness: u_x = 1 (a1 in GE), u_y = 0 (a2 not in GE), u_z = 1 (a3 in GE)."
        ),
    },
    "example_5_11": {
        "id": "example_5_11",
        "name": "Example 5.11 (Variant with Defeat Cancelation)",
        "description": (
            "Variant of Example 5.10 introducing argument a6 owned by agent x, with attack (a6, a3). "
            "Agent types: x owns {a1, a4, a5, a6}, y owns {a2}, z owns {a3}. "
            "Odd path a1->a2->a3->a4 still exists (T5.4 fails!), but revealing a6 defeats a3 directly, "
            "canceling the indirect self-defeat. Truthfulness achieves maximum utility u_x = 4. "
            "Hence, this framework IS strategyproof, proving Theorem 5.4 is sufficient but not necessary! "
            "[Book Misprint Note: In the discussion after Example 5.11, the text erroneously states that a5 "
            "cancels the indirect self-defeat; the argument that cancels it is actually a6]."
        ),
        "arguments": ["a1", "a2", "a3", "a4", "a5", "a6"],
        "attacks": [
            ["a1", "a2"],
            ["a2", "a3"],
            ["a3", "a4"],
            ["a3", "a5"],
            ["a6", "a3"],
        ],
        "agents": {
            "x": ["a1", "a4", "a5", "a6"],
            "y": ["a2"],
            "z": ["a3"],
        },
        "misprint_notes": (
            "In the text discussion following Example 5.11, the argument that cancels the indirect self-defeat "
            "is erroneously referred to as a5; the correct argument is a6."
        ),
    },
    "nixon_diamond": {
        "id": "nixon_diamond",
        "name": "Nixon Diamond (2-Cycle Mutual Attack)",
        "description": (
            "Classic dilemma: Quaker(Q) and Republican(R) mutually attack on Pacifist(P) vs Hawk(H). "
            "Demonstrates multiple complete, preferred, and stable extensions."
        ),
        "arguments": ["Quaker", "Republican", "Pacifist", "Hawk"],
        "attacks": [["Quaker", "Hawk"], ["Republican", "Pacifist"], ["Pacifist", "Hawk"], ["Hawk", "Pacifist"]],
        "agents": {
            "Agent_1": ["Quaker", "Pacifist"],
            "Agent_2": ["Republican", "Hawk"],
        },
    },
    "odd_cycle_3": {
        "id": "odd_cycle_3",
        "name": "3-Cycle Paradox (No Stable Extension)",
        "description": (
            "Directed 3-cycle: a -> b -> c -> a. "
            "Has empty grounded extension, single complete extension (empty set), no stable extension, "
            "and all arguments are UNDEC."
        ),
        "arguments": ["a", "b", "c"],
        "attacks": [["a", "b"], ["b", "c"], ["c", "a"]],
        "agents": {
            "Agent_1": ["a"],
            "Agent_2": ["b"],
            "Agent_3": ["c"],
        },
    },
    "floating_acceptance": {
        "id": "floating_acceptance",
        "name": "Floating Acceptance",
        "description": (
            "Even cycle a <-> b, where both a and b attack c, and c attacks d. "
            "In every preferred extension, either a or b is accepted, so c is always attacked, "
            "leading to d being skeptically accepted under preferred semantics."
        ),
        "arguments": ["a", "b", "c", "d"],
        "attacks": [["a", "b"], ["b", "a"], ["a", "c"], ["b", "c"], ["c", "d"]],
        "agents": {
            "Agent_1": ["a", "c"],
            "Agent_2": ["b", "d"],
        },
    },
    "self_attacking_arg": {
        "id": "self_attacking_arg",
        "name": "Self-Attacking Argument",
        "description": (
            "Argument s attacks itself (s -> s) and attacks a (s -> a). "
            "Since s is self-attacking, it cannot be in any conflict-free set, allowing a to be accepted."
        ),
        "arguments": ["s", "a"],
        "attacks": [["s", "s"], ["s", "a"]],
        "agents": {
            "Agent_1": ["s"],
            "Agent_2": ["a"],
        },
    },
    "chain_4": {
        "id": "chain_4",
        "name": "4-Argument Directed Chain",
        "description": "Simple linear chain: a -> b -> c -> d. Grounded extension is {a, c}.",
        "arguments": ["a", "b", "c", "d"],
        "attacks": [["a", "b"], ["b", "c"], ["c", "d"]],
        "agents": {
            "Agent_1": ["a", "b"],
            "Agent_2": ["c", "d"],
        },
    },
}
