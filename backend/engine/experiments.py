"""Random Experiment Engine for Strategic Argumentation.

Generates random instances, evaluates Theorem 5.3 (exact strategyproofness) and
Theorem 5.4 (odd-length path sufficiency), and exports CSV, JSON, and Matplotlib charts.
"""

import json
import os
import random
import time
from typing import Any, Callable, Dict, List, Optional, Tuple

import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
import pandas as pd

from backend.engine.framework import ArgumentationFramework
from backend.engine.strategic import MultiAgentArgumentation


def generate_random_instance(
    num_agents: int = 3,
    num_args_range: Tuple[int, int] = (6, 8),
    p: float = 0.25,
    allow_self_attacks: bool = False,
    rng: Optional[random.Random] = None,
) -> Tuple[ArgumentationFramework, Dict[str, List[str]]]:
    """Generate a single random argumentation instance.

    Args:
        num_agents: Number of agents (default: 3).
        num_args_range: Range (min, max) for number of arguments (default: 6 to 8).
        p: Probability that any directed pair (u, v) is an attack edge.
        allow_self_attacks: Whether self-attacks (u, u) are allowed.
        rng: Random number generator instance for reproducibility.
    """
    if rng is None:
        rng = random.Random()

    num_args = rng.randint(num_args_range[0], num_args_range[1])
    arguments = [f"arg_{i+1}" for i in range(num_args)]

    # Attacks generation
    attacks: List[Tuple[str, str]] = []
    for u in arguments:
        for v in arguments:
            if u == v and not allow_self_attacks:
                continue
            if rng.random() < p:
                attacks.append((u, v))

    # Random partition of arguments among agents
    # Guarantee each agent has at least 1 argument if num_args >= num_agents
    agent_ids = [f"Agent_{i+1}" for i in range(num_agents)]
    shuffled_args = list(arguments)
    rng.shuffle(shuffled_args)

    agent_ownership: Dict[str, List[str]] = {aid: [] for aid in agent_ids}

    # First give 1 argument to each agent
    for i in range(min(num_agents, len(shuffled_args))):
        agent_ownership[agent_ids[i]].append(shuffled_args[i])

    # Assign remaining arguments uniformly at random
    for arg in shuffled_args[num_agents:]:
        chosen_agent = rng.choice(agent_ids)
        agent_ownership[chosen_agent].append(arg)

    af = ArgumentationFramework(arguments, attacks)
    return af, agent_ownership


def evaluate_single_instance(
    af: ArgumentationFramework,
    agent_ownership: Dict[str, List[str]],
    instance_id: int = 0,
    p: float = 0.25,
) -> Dict[str, Any]:
    """Evaluate both Theorem 5.3 and Theorem 5.4 on a single multi-agent AF instance."""
    multi_agent = MultiAgentArgumentation(af, agent_ownership)

    t5_3 = multi_agent.verify_theorem_5_3_strategyproofness()
    t5_4 = multi_agent.verify_theorem_5_4_condition()

    sp = t5_3["is_strategyproof"]
    t5_4_holds = t5_4["satisfies_condition"]

    if t5_4_holds and sp:
        category = "T5.4 Satisfied & Strategyproof"
    elif not t5_4_holds and sp:
        category = "T5.4 Failed & Strategyproof"
    elif not t5_4_holds and not sp:
        category = "T5.4 Failed & Not Strategyproof"
    else:
        category = "T5.4 Satisfied & Not Strategyproof"

    return {
        "instance_id": instance_id,
        "p": p,
        "num_arguments": len(af.arguments),
        "num_attacks": len(af.attacks),
        "is_strategyproof": sp,
        "satisfies_theorem_5_4": t5_4_holds,
        "category": category,
        "counterexample_count": t5_3["counterexample_count"],
        "t5_4_violations_count": t5_4["violations_count"],
        "arguments": sorted(list(af.arguments)),
        "attacks": sorted(list(af.attacks)),
        "agent_ownership": {k: sorted(v) for k, v in agent_ownership.items()},
    }


def run_experiment_suite(
    probabilities: Optional[List[float]] = None,
    instances_per_p: int = 1000,
    seed: int = 42,
    allow_self_attacks: bool = False,
    progress_callback: Optional[Callable[[int, int, str], None]] = None,
) -> Dict[str, Any]:
    """Run full academic experiment suite across configured attack probabilities.

    Default probabilities: p in {0.15, 0.25, 0.35} with at least 1000 instances each.
    """
    if probabilities is None:
        probabilities = [0.15, 0.25, 0.35]

    rng = random.Random(seed)
    total_instances = len(probabilities) * instances_per_p
    completed = 0

    all_records: List[Dict[str, Any]] = []
    p_summaries: Dict[str, Dict[str, Any]] = {}

    start_time = time.time()

    for p in probabilities:
        p_records = []
        sp_count = 0
        t5_4_satisfied_count = 0
        cat_counts = {
            "T5.4 Satisfied & Strategyproof": 0,
            "T5.4 Failed & Strategyproof": 0,
            "T5.4 Failed & Not Strategyproof": 0,
            "T5.4 Satisfied & Not Strategyproof": 0,
        }

        # Track representative samples for qualitative explanation
        sample_t5_4_fail_but_sp: Optional[Dict[str, Any]] = None
        sample_t5_4_fail_and_not_sp: Optional[Dict[str, Any]] = None

        for idx in range(instances_per_p):
            instance_id = completed + 1
            af, ownership = generate_random_instance(
                num_agents=3,
                num_args_range=(6, 8),
                p=p,
                allow_self_attacks=allow_self_attacks,
                rng=rng,
            )
            eval_res = evaluate_single_instance(af, ownership, instance_id=instance_id, p=p)
            p_records.append(eval_res)
            all_records.append(eval_res)

            if eval_res["is_strategyproof"]:
                sp_count += 1
            if eval_res["satisfies_theorem_5_4"]:
                t5_4_satisfied_count += 1

            cat = eval_res["category"]
            cat_counts[cat] = cat_counts.get(cat, 0) + 1

            if cat == "T5.4 Failed & Strategyproof" and sample_t5_4_fail_but_sp is None:
                sample_t5_4_fail_but_sp = eval_res
            if cat == "T5.4 Failed & Not Strategyproof" and sample_t5_4_fail_and_not_sp is None:
                sample_t5_4_fail_and_not_sp = eval_res

            completed += 1
            if progress_callback and completed % 250 == 0:
                progress_callback(completed, total_instances, f"Evaluated p={p}: {idx+1}/{instances_per_p}")

        p_summaries[str(p)] = {
            "p": p,
            "total_instances": instances_per_p,
            "strategyproof_count": sp_count,
            "strategyproof_fraction": round(sp_count / instances_per_p, 4),
            "strategyproof_percentage": round(100.0 * sp_count / instances_per_p, 2),
            "t5_4_satisfied_count": t5_4_satisfied_count,
            "t5_4_satisfied_fraction": round(t5_4_satisfied_count / instances_per_p, 4),
            "t5_4_satisfied_percentage": round(100.0 * t5_4_satisfied_count / instances_per_p, 2),
            "categories": cat_counts,
            "sample_t5_4_fail_but_sp": sample_t5_4_fail_but_sp,
            "sample_t5_4_fail_and_not_sp": sample_t5_4_fail_and_not_sp,
        }

    elapsed_time = round(time.time() - start_time, 2)

    return {
        "metadata": {
            "total_instances": total_instances,
            "probabilities": probabilities,
            "instances_per_p": instances_per_p,
            "seed": seed,
            "allow_self_attacks": allow_self_attacks,
            "elapsed_seconds": elapsed_time,
        },
        "p_summaries": p_summaries,
        "all_records": all_records,
    }


def save_and_plot_results(
    experiment_data: Dict[str, Any],
    output_dir: str = "d:\\autonomous\\data",
) -> Dict[str, str]:
    """Save experiment records to CSV/JSON and render Matplotlib plots.

    Returns:
        Dict mapping artifact names to their file paths.
    """
    os.makedirs(output_dir, exist_ok=True)
    charts_dir = os.path.join(output_dir, "charts")
    os.makedirs(charts_dir, exist_ok=True)

    csv_path = os.path.join(output_dir, "experiments_results.csv")
    json_path = os.path.join(output_dir, "experiments_results.json")
    chart_sp_path = os.path.join(charts_dir, "strategyproofness_by_p.png")
    chart_comp_path = os.path.join(charts_dir, "theorem_comparison.png")
    chart_dist_path = os.path.join(charts_dir, "outcome_distribution.png")

    # 1. Export JSON (with summary and metadata, plus sample records)
    export_json = {
        "metadata": experiment_data["metadata"],
        "p_summaries": experiment_data["p_summaries"],
        "sample_records": experiment_data["all_records"][:100],  # first 100 for compact JSON preview
    }
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(export_json, f, indent=2)

    # 2. Export CSV using Pandas
    df_rows = []
    for r in experiment_data["all_records"]:
        df_rows.append({
            "instance_id": r["instance_id"],
            "p": r["p"],
            "num_arguments": r["num_arguments"],
            "num_attacks": r["num_attacks"],
            "is_strategyproof": r["is_strategyproof"],
            "satisfies_theorem_5_4": r["satisfies_theorem_5_4"],
            "category": r["category"],
            "counterexamples": r["counterexample_count"],
            "t5_4_violations": r["t5_4_violations_count"],
        })
    df = pd.DataFrame(df_rows)
    df.to_csv(csv_path, index=False)

    # 3. Chart 1: Strategyproofness & T5.4 by p
    probs = [s["p"] for s in experiment_data["p_summaries"].values()]
    sp_pcts = [s["strategyproof_percentage"] for s in experiment_data["p_summaries"].values()]
    t54_pcts = [s["t5_4_satisfied_percentage"] for s in experiment_data["p_summaries"].values()]

    plt.figure(figsize=(8, 5))
    x = range(len(probs))
    width = 0.35

    plt.bar([i - width / 2 for i in x], sp_pcts, width=width, label="Strategyproof (T5.3)", color="#3b82f6")
    plt.bar([i + width / 2 for i in x], t54_pcts, width=width, label="T5.4 Satisfied", color="#10b981")

    plt.xlabel("Attack Probability p", fontsize=11, fontweight="bold")
    plt.ylabel("Percentage (%)", fontsize=11, fontweight="bold")
    plt.title("Mechanism Strategyproofness & Theorem 5.4 Satisfaction vs p", fontsize=12, fontweight="bold")
    plt.xticks(x, [f"p = {p}" for p in probs])
    plt.ylim(0, 100)
    plt.grid(axis="y", linestyle="--", alpha=0.7)
    plt.legend(frameon=True)

    for i in x:
        plt.text(i - width / 2, sp_pcts[i] + 1.5, f"{sp_pcts[i]:.1f}%", ha="center", fontsize=9, fontweight="bold")
        plt.text(i + width / 2, t54_pcts[i] + 1.5, f"{t54_pcts[i]:.1f}%", ha="center", fontsize=9, fontweight="bold")

    plt.tight_layout()
    plt.savefig(chart_sp_path, dpi=300)
    plt.close()

    # 4. Chart 2: Stacked Outcome Categories by p
    cat_keys = [
        "T5.4 Satisfied & Strategyproof",
        "T5.4 Failed & Strategyproof",
        "T5.4 Failed & Not Strategyproof",
        "T5.4 Satisfied & Not Strategyproof",
    ]
    colors = ["#10b981", "#6366f1", "#ef4444", "#f59e0b"]

    plt.figure(figsize=(9, 5.5))
    bottoms = [0] * len(probs)

    for cat_idx, cat in enumerate(cat_keys):
        values = [s["categories"].get(cat, 0) for s in experiment_data["p_summaries"].values()]
        plt.bar(x, values, bottom=bottoms, label=cat, color=colors[cat_idx], width=0.5)
        bottoms = [bottoms[i] + values[i] for i in range(len(probs))]

    plt.xlabel("Attack Probability p", fontsize=11, fontweight="bold")
    plt.ylabel("Instance Count (out of 1000)", fontsize=11, fontweight="bold")
    plt.title("Distribution of Theoretical Outcomes Across Attack Densities", fontsize=12, fontweight="bold")
    plt.xticks(x, [f"p = {p}" for p in probs])
    plt.legend(loc="upper right", frameon=True, fontsize=9)
    plt.grid(axis="y", linestyle="--", alpha=0.6)
    plt.tight_layout()
    plt.savefig(chart_comp_path, dpi=300)
    plt.close()

    # 5. Chart 3: Overall Theorem Sufficiency & Non-Necessity Pie/Bar
    total_t54_sat_sp_fail = sum(s["categories"].get("T5.4 Satisfied & Not Strategyproof", 0) for s in experiment_data["p_summaries"].values())
    total_t54_fail_sp_true = sum(s["categories"].get("T5.4 Failed & Strategyproof", 0) for s in experiment_data["p_summaries"].values())
    total_t54_sat_sp_true = sum(s["categories"].get("T5.4 Satisfied & Strategyproof", 0) for s in experiment_data["p_summaries"].values())
    total_t54_fail_sp_fail = sum(s["categories"].get("T5.4 Failed & Not Strategyproof", 0) for s in experiment_data["p_summaries"].values())

    plt.figure(figsize=(8, 5))
    categories_all = [
        "T5.4 Satisfied\n& SP (Soundness)",
        "T5.4 Failed\n& SP (Non-Necessity)",
        "T5.4 Failed\n& Not SP (Vulnerable)",
        "T5.4 Satisfied\n& Not SP (Impossible)",
    ]
    vals = [total_t54_sat_sp_true, total_t54_fail_sp_true, total_t54_fail_sp_fail, total_t54_sat_sp_fail]

    bars = plt.bar(categories_all, vals, color=["#10b981", "#6366f1", "#ef4444", "#94a3b8"], width=0.55)
    plt.ylabel("Total Instances", fontsize=11, fontweight="bold")
    plt.title(f"Empirical Validation of Theorem 5.4 Sufficiency (N={len(experiment_data['all_records'])})", fontsize=12, fontweight="bold")
    plt.grid(axis="y", linestyle="--", alpha=0.6)

    for bar in bars:
        h = bar.get_height()
        plt.text(bar.get_x() + bar.get_width() / 2, h + 20, f"{int(h)}", ha="center", fontsize=10, fontweight="bold")

    plt.tight_layout()
    plt.savefig(chart_dist_path, dpi=300)
    plt.close()

    return {
        "csv": csv_path,
        "json": json_path,
        "chart_sp": chart_sp_path,
        "chart_comp": chart_comp_path,
        "chart_dist": chart_dist_path,
    }
