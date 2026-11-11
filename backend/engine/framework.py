"""Argumentation Framework and Abstract Argumentation Engine.

This module implements Dung's Abstract Argumentation Framework (AF = <A, R>)
from first principles without third-party black-box argumentation libraries.
"""

from itertools import chain, combinations
from typing import Any, Dict, Iterable, List, Optional, Set, Tuple


class ArgumentationFramework:
    """Represents an Abstract Argumentation Framework AF = <A, R>."""

    def __init__(
        self,
        arguments: Optional[Iterable[str]] = None,
        attacks: Optional[Iterable[Tuple[str, str]]] = None,
    ):
        """Initialize AF with a set of arguments and directed attack pairs.

        Args:
            arguments: Collection of argument identifiers.
            attacks: Collection of directed pairs (alpha, beta) where alpha attacks beta.
        """
        self.arguments: Set[str] = set(arguments) if arguments is not None else set()
        self.attacks: Set[Tuple[str, str]] = set()

        if attacks is not None:
            for u, v in attacks:
                if u in self.arguments and v in self.arguments:
                    self.attacks.add((u, v))
                else:
                    # Automatically ensure arguments present if attacks reference them
                    self.arguments.add(u)
                    self.arguments.add(v)
                    self.attacks.add((u, v))

        self._rebuild_adjacency()

    def _rebuild_adjacency(self) -> None:
        """Precompute incoming (attackers) and outgoing (attackees) adjacency maps."""
        self._attackers: Dict[str, Set[str]] = {arg: set() for arg in self.arguments}
        self._attackees: Dict[str, Set[str]] = {arg: set() for arg in self.arguments}
        for u, v in self.attacks:
            if u in self._attackees:
                self._attackees[u].add(v)
            if v in self._attackers:
                self._attackers[v].add(u)

    def add_argument(self, arg: str) -> None:
        """Add an argument to the framework."""
        if arg not in self.arguments:
            self.arguments.add(arg)
            self._attackers[arg] = set()
            self._attackees[arg] = set()

    def remove_argument(self, arg: str) -> None:
        """Remove an argument and all associated attacks."""
        if arg in self.arguments:
            self.arguments.remove(arg)
            self.attacks = {(u, v) for (u, v) in self.attacks if u != arg and v != arg}
            self._rebuild_adjacency()

    def add_attack(self, attacker: str, target: str) -> None:
        """Add a directed attack (attacker -> target)."""
        self.add_argument(attacker)
        self.add_argument(target)
        self.attacks.add((attacker, target))
        self._attackees[attacker].add(target)
        self._attackers[target].add(attacker)

    def remove_attack(self, attacker: str, target: str) -> None:
        """Remove a directed attack."""
        if (attacker, target) in self.attacks:
            self.attacks.remove((attacker, target))
            self._attackees[attacker].discard(target)
            self._attackers[target].discard(attacker)

    def attackers_of(self, arg: str) -> Set[str]:
        """Return the set of arguments attacking `arg`."""
        return self._attackers.get(arg, set())

    def targets_of(self, arg: str) -> Set[str]:
        """Return the set of arguments attacked by `arg`."""
        return self._attackees.get(arg, set())

    def range_of(self, S: Iterable[str]) -> Set[str]:
        """Return S+ = S U R(S), where R(S) is the set of arguments attacked by S."""
        S_set = set(S)
        attacked = set()
        for s in S_set:
            attacked.update(self._attackees.get(s, set()))
        return S_set | attacked

    def attacked_by_set(self, S: Iterable[str]) -> Set[str]:
        """Return R(S) = { beta in A | exists alpha in S, (alpha, beta) in R }."""
        attacked = set()
        for s in S:
            attacked.update(self._attackees.get(s, set()))
        return attacked

    # -------------------------------------------------------------------------
    # Core Dung Semantics Checks (Assignment 3, Part A: 2 - 5)
    # -------------------------------------------------------------------------

    def is_conflict_free(self, S: Iterable[str]) -> bool:
        """Requirement 2: Test if a given set S of arguments is conflict-free.

        A set S is conflict-free iff there are no alpha, beta in S such that (alpha, beta) in R.
        """
        S_set = set(S)
        for s in S_set:
            # If any target of s is also in S, conflict exists
            targets = self._attackees.get(s, set())
            if not targets.isdisjoint(S_set):
                return False
        return True

    def defends(self, S: Iterable[str], alpha: str) -> bool:
        """Requirement 3: Test if a given argument alpha can be defended by a given set S.

        S defends alpha iff for every beta in A such that (beta, alpha) in R,
        there exists gamma in S such that (gamma, beta) in R.
        """
        if alpha not in self.arguments:
            return False
        S_set = set(S)
        attackers = self._attackers.get(alpha, set())
        for beta in attackers:
            # Check if S attacks beta
            attackers_of_beta = self._attackers.get(beta, set())
            if S_set.isdisjoint(attackers_of_beta):
                return False
        return True

    def characteristic_function(self, S: Iterable[str]) -> Set[str]:
        """Requirement 4: Characteristic function F(S) identifying the set of arguments defended by S.

        F(S) = { alpha in A | alpha is defended by S }.
        """
        S_set = set(S)
        return {alpha for alpha in self.arguments if self.defends(S_set, alpha)}

    def is_admissible(self, S: Iterable[str]) -> bool:
        """Requirement 5 (part 1): Check if a given set S is admissible.

        S is admissible iff S is conflict-free and S defends all its elements (S subset of F(S)).
        """
        S_set = set(S)
        if not self.is_conflict_free(S_set):
            return False
        for arg in S_set:
            if not self.defends(S_set, arg):
                return False
        return True

    def is_complete_extension(self, S: Iterable[str]) -> bool:
        """Requirement 5 (part 2): Check if a given set S is a complete extension.

        S is a complete extension iff S is admissible and F(S) = S.
        """
        S_set = set(S)
        if not self.is_admissible(S_set):
            return False
        return self.characteristic_function(S_set) == S_set

    # -------------------------------------------------------------------------
    # Extension Computations (Assignment 3, Part A: 6.A - 6.E)
    # -------------------------------------------------------------------------

    def get_grounded_extension(self) -> Tuple[Set[str], List[Dict[str, Any]]]:
        """Requirement 6.A: Compute grounded extension using iterative characteristic function until fixed point.

        Returns:
            Tuple of (grounded_extension, iteration_log).
            iteration_log contains step-by-step sets S_k and new additions.
        """
        current: Set[str] = set()
        iterations: List[Dict[str, Any]] = []
        step = 0

        iterations.append({
            "step": step,
            "set": sorted(list(current)),
            "new_added": [],
            "description": "Initial base step: S_0 = empty set",
        })

        while True:
            step += 1
            next_set = self.characteristic_function(current)
            new_added = sorted(list(next_set - current))
            iterations.append({
                "step": step,
                "set": sorted(list(next_set)),
                "new_added": new_added,
                "description": f"Step {step}: F(S_{step-1}) = {sorted(list(next_set))}",
            })
            if next_set == current:
                break
            current = next_set

        return current, iterations

    def _all_subsets(self) -> Iterable[Set[str]]:
        """Generate all 2^|A| subsets of arguments."""
        arg_list = sorted(list(self.arguments))
        for r in range(len(arg_list) + 1):
            for combo in combinations(arg_list, r):
                yield set(combo)

    def get_complete_extensions(self) -> List[Set[str]]:
        """Requirement 6.B: Compute all complete extensions."""
        complete_extensions = []
        for subset in self._all_subsets():
            if self.is_complete_extension(subset):
                complete_extensions.append(subset)
        return complete_extensions

    def get_preferred_extensions(self) -> List[Set[str]]:
        """Requirement 6.C (part 1): Compute all preferred extensions.

        A preferred extension is a maximal (w.r.t set inclusion) admissible set.
        Every preferred extension is also a complete extension.
        """
        admissible_sets = [s for s in self._all_subsets() if self.is_admissible(s)]
        preferred = []
        for candidate in admissible_sets:
            is_maximal = True
            for other in admissible_sets:
                if candidate < other:
                    is_maximal = False
                    break
            if is_maximal:
                preferred.append(candidate)
        return preferred

    def is_stable_extension(self, S: Iterable[str]) -> bool:
        """Check if S is a stable extension.

        S is stable iff S is conflict-free and S attacks every argument outside S.
        """
        S_set = set(S)
        if not self.is_conflict_free(S_set):
            return False
        attacked = self.attacked_by_set(S_set)
        outside = self.arguments - S_set
        return outside.issubset(attacked)

    def get_stable_extensions(self) -> List[Set[str]]:
        """Requirement 6.C (part 2): Compute all stable extensions."""
        stable = []
        for subset in self._all_subsets():
            if self.is_stable_extension(subset):
                stable.append(subset)
        return stable

    def get_semi_stable_extensions(self) -> List[Set[str]]:
        """Requirement 6.C (part 3): Compute all semi-stable extensions.

        A complete extension S is semi-stable iff its range S+ = S U R(S) is inclusion-maximal
        among all complete extensions.
        """
        complete_exts = self.get_complete_extensions()
        if not complete_exts:
            return []

        ranges = {tuple(sorted(s)): self.range_of(s) for s in complete_exts}
        semi_stable = []

        for s in complete_exts:
            s_range = ranges[tuple(sorted(s))]
            is_maximal = True
            for other in complete_exts:
                if s == other:
                    continue
                other_range = ranges[tuple(sorted(other))]
                if s_range < other_range:
                    is_maximal = False
                    break
            if is_maximal:
                semi_stable.append(s)

        return semi_stable

    def get_all_extensions_summary(self) -> Dict[str, List[List[str]]]:
        """Compute all extension types and return sorted lists of strings for JSON serialization."""
        grounded, _ = self.get_grounded_extension()
        complete = self.get_complete_extensions()
        preferred = self.get_preferred_extensions()
        stable = self.get_stable_extensions()
        semi_stable = self.get_semi_stable_extensions()

        return {
            "grounded": [sorted(list(grounded))],
            "complete": [sorted(list(s)) for s in complete],
            "preferred": [sorted(list(s)) for s in preferred],
            "stable": [sorted(list(s)) for s in stable],
            "semi_stable": [sorted(list(s)) for s in semi_stable],
        }

    def get_legal_labellings(self) -> List[Dict[str, str]]:
        r"""Requirement 6.D: Generate all legal (IN/OUT/UNDEC) labellings.

        Under Caminada's labelling theory, there is a 1-to-1 correspondence between
        complete extensions and legal labellings:
        - in(L) = S (where S is a complete extension)
        - out(L) = R(S) (arguments attacked by S)
        - undec(L) = A \ (S U R(S))
        """
        complete_exts = self.get_complete_extensions()
        labellings = []

        for s in complete_exts:
            in_set = s
            out_set = self.attacked_by_set(s)
            undec_set = self.arguments - (in_set | out_set)

            labelling = {}
            for arg in sorted(list(self.arguments)):
                if arg in in_set:
                    labelling[arg] = "IN"
                elif arg in out_set:
                    labelling[arg] = "OUT"
                else:
                    labelling[arg] = "UNDEC"
            labellings.append(labelling)

        return labellings

    def get_acceptance_status(self, alpha: str, semantics: str = "grounded") -> Dict[str, Any]:
        """Requirement 6.E: Report acceptance status of an argument alpha.

        Semantics options: 'grounded', 'complete', 'preferred', 'stable', 'semi_stable'.

        Acceptance Status:
        - Skeptically accepted: in EVERY extension of that semantics.
        - Credulously accepted: in AT LEAST ONE extension of that semantics (but not all).
        - Rejected: in NO extension of that semantics.
        """
        if alpha not in self.arguments:
            return {
                "argument": alpha,
                "semantics": semantics,
                "status": "not_in_framework",
                "in_all": False,
                "in_any": False,
                "extension_count": 0,
                "extensions": [],
                "explanation": f"Argument '{alpha}' is not present in the framework.",
            }

        sem_lower = semantics.lower().replace("-", "_")
        if sem_lower == "grounded":
            ext, _ = self.get_grounded_extension()
            extensions = [ext]
        elif sem_lower == "complete":
            extensions = self.get_complete_extensions()
        elif sem_lower == "preferred":
            extensions = self.get_preferred_extensions()
        elif sem_lower == "stable":
            extensions = self.get_stable_extensions()
        elif sem_lower in ("semi_stable", "semi-stable"):
            extensions = self.get_semi_stable_extensions()
        else:
            raise ValueError(f"Unknown semantics: {semantics}")

        if not extensions:
            return {
                "argument": alpha,
                "semantics": semantics,
                "status": "rejected",
                "in_all": False,
                "in_any": False,
                "extension_count": 0,
                "extensions": [],
                "explanation": f"No extensions exist under {semantics} semantics.",
            }

        in_count = sum(1 for ext in extensions if alpha in ext)
        total = len(extensions)

        if in_count == total:
            status = "skeptically_accepted"
            explanation = f"'{alpha}' is present in all {total} {semantics} extension(s)."
        elif in_count > 0:
            status = "credulously_accepted"
            explanation = f"'{alpha}' is present in {in_count} of {total} {semantics} extension(s)."
        else:
            status = "rejected"
            explanation = f"'{alpha}' is not present in any {semantics} extension."

        return {
            "argument": alpha,
            "semantics": semantics,
            "status": status,
            "in_all": in_count == total,
            "in_any": in_count > 0,
            "in_count": in_count,
            "extension_count": total,
            "extensions": [sorted(list(ext)) for ext in extensions],
            "explanation": explanation,
        }

    # -------------------------------------------------------------------------
    # Serialization and Subgraph Helpers
    # -------------------------------------------------------------------------

    def induced_subgraph(self, subset: Iterable[str]) -> "ArgumentationFramework":
        """Return the induced sub-AF consisting only of arguments in `subset` and their attacks."""
        sub_args = set(subset) & self.arguments
        sub_attacks = [(u, v) for (u, v) in self.attacks if u in sub_args and v in sub_args]
        return ArgumentationFramework(sub_args, sub_attacks)

    def to_dict(self) -> Dict[str, Any]:
        """Export framework to JSON-serializable dictionary."""
        return {
            "arguments": sorted(list(self.arguments)),
            "attacks": sorted(list(self.attacks)),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ArgumentationFramework":
        """Create an AF from a dictionary with 'arguments' and 'attacks' keys."""
        args = data.get("arguments", [])
        attacks = [tuple(att) for att in data.get("attacks", [])]
        return cls(args, attacks)
