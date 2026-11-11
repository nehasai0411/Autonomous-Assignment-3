"""Strategic Argumentation and Mechanism Design.

This module implements the Grounded Direct Argumentation Mechanism,
Agent Utility computation, Best-response reporting, Theorem 5.3 (exact strategyproofness),
and Theorem 5.4 (odd-length directed path sufficient condition).
"""

from collections import deque
from itertools import combinations, product
from typing import Any, Dict, Iterable, List, Optional, Set, Tuple

from backend.engine.framework import ArgumentationFramework


class MultiAgentArgumentation:
    """Represents a multi-agent argumentation framework where agents own disjoint subsets of arguments."""

    def __init__(
        self,
        framework: ArgumentationFramework,
        agent_ownership: Dict[str, Iterable[str]],
    ):
        """Initialize with an AF and mapping of agent_id -> owned arguments.

        Args:
            framework: The global ArgumentationFramework AF = <A, R>.
            agent_ownership: Mapping from agent_id to the set of arguments owned by that agent.
        """
        self.framework = framework
        self.agent_ownership: Dict[str, Set[str]] = {
            agent_id: set(args) & framework.arguments
            for agent_id, args in agent_ownership.items()
        }

        # Validate disjointness
        all_owned: Set[str] = set()
        for agent_id, args in self.agent_ownership.items():
            overlap = all_owned & args
            if overlap:
                raise ValueError(
                    f"Arguments {overlap} are assigned to multiple agents. Ownership must be disjoint."
                )
            all_owned.update(args)

    @property
    def agent_ids(self) -> List[str]:
        """Return sorted list of agent identifiers."""
        return sorted(list(self.agent_ownership.keys()))

    def get_owned_arguments(self, agent_id: str) -> Set[str]:
        """Return the arguments privately owned by `agent_id`."""
        return self.agent_ownership.get(agent_id, set())

    # -------------------------------------------------------------------------
    # 1. Grounded Direct Mechanism & Utility (Assignment 3, Strategic: 1 & 2)
    # -------------------------------------------------------------------------

    def grounded_mechanism(
        self, revealed_reports: Dict[str, Iterable[str]]
    ) -> Tuple[Set[str], List[Dict[str, Any]]]:
        """Requirement 1: Grounded direct argumentation mechanism.

        Takes global attack relation and one revealed argument set per agent,
        and returns the grounded extension of the graph induced by the union of revealed arguments.

        Args:
            revealed_reports: Dict mapping agent_id -> revealed subset A_i^o subset of A_i.

        Returns:
            Tuple of (grounded_extension, iteration_log).
        """
        revealed_union: Set[str] = set()
        for agent_id, report in revealed_reports.items():
            valid_args = set(report) & self.get_owned_arguments(agent_id)
            revealed_union.update(valid_args)

        induced_af = self.framework.induced_subgraph(revealed_union)
        return induced_af.get_grounded_extension()

    def compute_utility(
        self, agent_id: str, revealed_reports: Dict[str, Iterable[str]]
    ) -> int:
        """Requirement 2: Utility of agent i.

        An agent associates its utility to the number of its originally owned arguments
        present in the grounded extension.
        u_i(A_1^o, ..., A_n^o) = | A_i cap GE(AF[Union A_j^o]) |.
        """
        grounded_ext, _ = self.grounded_mechanism(revealed_reports)
        owned = self.get_owned_arguments(agent_id)
        return len(owned & grounded_ext)

    def compute_all_utilities(
        self, revealed_reports: Dict[str, Iterable[str]]
    ) -> Dict[str, int]:
        """Compute utilities for all agents given a profile of revealed reports."""
        grounded_ext, _ = self.grounded_mechanism(revealed_reports)
        return {
            agent_id: len(self.get_owned_arguments(agent_id) & grounded_ext)
            for agent_id in self.agent_ids
        }

    # -------------------------------------------------------------------------
    # 2. Best Reports Enumeration (Assignment 3, Strategic: 2)
    # -------------------------------------------------------------------------

    def get_best_reports(
        self,
        agent_id: str,
        fixed_opponent_reports: Dict[str, Iterable[str]],
    ) -> Dict[str, Any]:
        """Requirement 2: Enumerate every subset of A_i that agent i could reveal, given fixed

        reports by the others, and return the reports that maximise agent i's utility.
        """
        owned = self.get_owned_arguments(agent_id)
        owned_list = sorted(list(owned))
        all_reports_data = []

        # Prepare fixed opponent profile
        current_profile: Dict[str, Iterable[str]] = {
            other_id: set(report)
            for other_id, report in fixed_opponent_reports.items()
            if other_id != agent_id
        }

        truthful_report = set(owned)
        max_utility = -1
        best_reports: List[Set[str]] = []

        # Enumerate all 2^|A_i| subsets
        for r in range(len(owned_list) + 1):
            for combo in combinations(owned_list, r):
                candidate_report = set(combo)
                current_profile[agent_id] = candidate_report

                grounded_ext, _ = self.grounded_mechanism(current_profile)
                utility = len(owned & grounded_ext)

                is_truthful = candidate_report == truthful_report

                all_reports_data.append({
                    "report": sorted(list(candidate_report)),
                    "hidden": sorted(list(owned - candidate_report)),
                    "grounded_extension": sorted(list(grounded_ext)),
                    "utility": utility,
                    "is_truthful": is_truthful,
                })

                if utility > max_utility:
                    max_utility = utility
                    best_reports = [candidate_report]
                elif utility == max_utility:
                    best_reports.append(candidate_report)

        # Mark which reports are best
        for entry in all_reports_data:
            entry["is_best_report"] = entry["utility"] == max_utility

        # Truthful report stats
        current_profile[agent_id] = truthful_report
        truthful_grounded, _ = self.grounded_mechanism(current_profile)
        truthful_utility = len(owned & truthful_grounded)

        truthful_is_best = truthful_utility == max_utility
        truthful_is_strictly_best = (
            truthful_is_best and len(best_reports) == 1 and best_reports[0] == truthful_report
        )

        return {
            "agent_id": agent_id,
            "owned_arguments": sorted(list(owned)),
            "fixed_opponent_reports": {
                k: sorted(list(v)) for k, v in fixed_opponent_reports.items() if k != agent_id
            },
            "all_reports": all_reports_data,
            "best_reports": [sorted(list(br)) for br in best_reports],
            "max_utility": max_utility,
            "truthful_utility": truthful_utility,
            "truthful_is_best": truthful_is_best,
            "truthful_is_strictly_best": truthful_is_strictly_best,
            "can_strictly_gain_by_hiding": max_utility > truthful_utility,
        }

    # -------------------------------------------------------------------------
    # 3. Theorem 5.3: Strategyproofness Verification (Assignment 3, Strategic: 3)
    # -------------------------------------------------------------------------

    def verify_theorem_5_3_strategyproofness(self) -> Dict[str, Any]:
        """Requirement 3: Check if the mechanism satisfies Theorem 5.3.

        Verifies whether for EVERY agent i, revealing all of A_i (truthfulness) is a best
        response against EVERY combination of subsets the other agents could reveal.

        Returns:
            Dict containing:
            - is_strategyproof: bool
            - total_combinations_checked: int
            - counterexamples: List of instances where hiding strictly improved utility
            - per_agent_status: Breakdown per agent
        """
        counterexamples = []
        total_checks = 0
        per_agent_status: Dict[str, Dict[str, Any]] = {}

        for agent_id in self.agent_ids:
            owned = self.get_owned_arguments(agent_id)
            owned_list = sorted(list(owned))
            truthful_report = set(owned)

            # Generate all possible opponent profiles
            other_agents = [oid for oid in self.agent_ids if oid != agent_id]
            opponent_subsets_list = []
            for other_id in other_agents:
                o_owned = sorted(list(self.get_owned_arguments(other_id)))
                o_subsets = [
                    set(c)
                    for r in range(len(o_owned) + 1)
                    for c in combinations(o_owned, r)
                ]
                opponent_subsets_list.append((other_id, o_subsets))

            agent_is_sp = True
            agent_counterexamples = []

            # If no other agents, opponent profile is trivial empty dict
            if not opponent_subsets_list:
                opponent_profiles = [{}]
            else:
                agent_names = [item[0] for item in opponent_subsets_list]
                subset_tuples = product(*[item[1] for item in opponent_subsets_list])
                opponent_profiles = [
                    dict(zip(agent_names, combo)) for combo in subset_tuples
                ]

            for opp_profile in opponent_profiles:
                # Compute truthful utility
                profile_truthful = dict(opp_profile)
                profile_truthful[agent_id] = truthful_report
                ge_truthful, _ = self.grounded_mechanism(profile_truthful)
                u_truthful = len(owned & ge_truthful)

                # Check all deviating subsets
                for r in range(len(owned_list)):  # strictly smaller subsets (hiding)
                    for combo in combinations(owned_list, r):
                        total_checks += 1
                        hiding_report = set(combo)
                        profile_hiding = dict(opp_profile)
                        profile_hiding[agent_id] = hiding_report
                        ge_hiding, _ = self.grounded_mechanism(profile_hiding)
                        u_hiding = len(owned & ge_hiding)

                        if u_hiding > u_truthful:
                            agent_is_sp = False
                            ce = {
                                "agent_id": agent_id,
                                "opponent_reports": {
                                    k: sorted(list(v)) for k, v in opp_profile.items()
                                },
                                "truthful_report": sorted(list(truthful_report)),
                                "truthful_grounded": sorted(list(ge_truthful)),
                                "truthful_utility": u_truthful,
                                "hiding_report": sorted(list(hiding_report)),
                                "hidden_arguments": sorted(list(truthful_report - hiding_report)),
                                "hiding_grounded": sorted(list(ge_hiding)),
                                "hiding_utility": u_hiding,
                                "utility_gain": u_hiding - u_truthful,
                                "gained_arguments": sorted(
                                    list((owned & ge_hiding) - (owned & ge_truthful))
                                ),
                            }
                            agent_counterexamples.append(ce)
                            counterexamples.append(ce)

            per_agent_status[agent_id] = {
                "is_strategyproof": agent_is_sp,
                "counterexamples_count": len(agent_counterexamples),
                "sample_counterexample": (
                    agent_counterexamples[0] if agent_counterexamples else None
                ),
            }

        is_strategyproof = len(counterexamples) == 0

        return {
            "is_strategyproof": is_strategyproof,
            "total_combinations_checked": total_checks,
            "counterexample_count": len(counterexamples),
            "counterexamples": counterexamples[:50],  # cap for serialization if many
            "per_agent_status": per_agent_status,
        }

    # -------------------------------------------------------------------------
    # 4. Theorem 5.4: Odd-Length Directed Path Condition (Assignment 3, Strategic: 4)
    # -------------------------------------------------------------------------

    def find_shortest_odd_directed_path(
        self, start: str, target: str
    ) -> Optional[List[str]]:
        """Find the shortest directed path of odd length from `start` to `target` in the full AF graph.

        Handles arbitrary cycles using BFS on the parity product graph (state: (node, parity)).
        Parity: 0 for even distance from start, 1 for odd distance from start.

        Returns:
            List of argument names representing the sequence [start, ..., target] if an odd path
            exists, else None.
        """
        # Queue stores: (current_node, current_parity, path_list)
        queue: deque[Tuple[str, int, List[str]]] = deque()
        visited: Set[Tuple[str, int]] = set()

        # Initial step: all outgoing edges from start have length 1 (odd)
        for neighbor in self.framework.targets_of(start):
            state = (neighbor, 1)
            visited.add(state)
            path = [start, neighbor]
            if neighbor == target:
                return path
            queue.append((neighbor, 1, path))

        while queue:
            curr, parity, path = queue.popleft()
            next_parity = 1 - parity

            for neighbor in self.framework.targets_of(curr):
                state = (neighbor, next_parity)
                if state not in visited:
                    visited.add(state)
                    new_path = path + [neighbor]
                    if neighbor == target and next_parity == 1:
                        return new_path
                    queue.append((neighbor, next_parity, new_path))

        return None

    def verify_theorem_5_4_condition(self) -> Dict[str, Any]:
        """Requirement 4: Check if grounded direct argumentation mechanism is strategyproof

        by verifying that NO agent holds two arguments alpha, beta with an odd-length directed
        path from alpha to beta in the full graph.

        Note: alpha and beta can be distinct OR identical (e.g. self-attack or odd cycle).
        Both alpha and beta must belong to the same agent A_i. The intermediate path arguments
        can belong to any agent.

        Returns:
            Dict containing:
            - satisfies_condition: bool (True if NO odd path exists between any alpha, beta in same A_i)
            - violating_pairs: List of violating pairs with exact paths
            - violations_count: int
        """
        violating_pairs = []

        for agent_id in self.agent_ids:
            owned = sorted(list(self.get_owned_arguments(agent_id)))
            for alpha in owned:
                for beta in owned:
                    odd_path = self.find_shortest_odd_directed_path(alpha, beta)
                    if odd_path is not None:
                        violating_pairs.append({
                            "agent_id": agent_id,
                            "source": alpha,
                            "target": beta,
                            "path_length": len(odd_path) - 1,
                            "path": odd_path,
                            "is_self_loop_or_cycle": alpha == beta,
                        })

        satisfies_condition = len(violating_pairs) == 0

        return {
            "satisfies_condition": satisfies_condition,
            "violations_count": len(violating_pairs),
            "violating_pairs": violating_pairs,
            "explanation": (
                "Condition satisfied: No agent holds two arguments with an odd-length directed path between them. "
                "By Theorem 5.4, the mechanism is GUARANTEED to be strategyproof."
                if satisfies_condition
                else f"Condition failed: Found {len(violating_pairs)} pair(s) of arguments owned by the same agent "
                "with an odd-length directed path between them. (Note: Theorem 5.4 is sufficient but not necessary; "
                "verify with Theorem 5.3 to check if strategyproofness still holds)."
            ),
        }

    def compare_theorems(self) -> Dict[str, Any]:
        """Compare Theorem 5.3 (strategyproofness) and Theorem 5.4 (sufficient condition)."""
        t5_3 = self.verify_theorem_5_3_strategyproofness()
        t5_4 = self.verify_theorem_5_4_condition()

        sp = t5_3["is_strategyproof"]
        cond = t5_4["satisfies_condition"]

        if cond and sp:
            category = "T5.4 Satisfied & Strategyproof"
            notes = "Theorem 5.4 holds and guarantees strategyproofness."
        elif not cond and sp:
            category = "T5.4 Failed & Strategyproof"
            notes = "Theorem 5.4 condition fails, yet the framework is strategyproof! Demonstrates non-necessity of T5.4."
        elif not cond and not sp:
            category = "T5.4 Failed & Not Strategyproof"
            notes = "Theorem 5.4 fails, and an agent can indeed strictly gain by hiding arguments (counterexample found)."
        else:
            category = "T5.4 Satisfied & Not Strategyproof"
            notes = "FATAL INCONSISTENCY: T5.4 is a sufficient condition, this state is mathematically impossible."

        return {
            "theorem_5_3": t5_3,
            "theorem_5_4": t5_4,
            "is_strategyproof": sp,
            "satisfies_theorem_5_4": cond,
            "category": category,
            "notes": notes,
        }
