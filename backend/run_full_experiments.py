"""Script to execute full 3000-instance academic experiments suite and generate reports/charts."""

import json
from backend.engine.experiments import run_experiment_suite, save_and_plot_results


def main():
    print("=" * 70)
    print("RUNNING ASSIGNMENT 3 EXPERIMENTS: 3 Agents, 6-8 Args, p in {0.15, 0.25, 0.35}")
    print("Target: 1000 instances per probability (3,000 instances total)")
    print("=" * 70)

    def progress(completed, total, msg):
        pct = (completed / total) * 100
        print(f"[{pct:5.1f}%] {msg}")

    results = run_experiment_suite(
        probabilities=[0.15, 0.25, 0.35],
        instances_per_p=1000,
        seed=42,
        allow_self_attacks=False,
        progress_callback=progress,
    )

    print("\nExperiments complete in", results["metadata"]["elapsed_seconds"], "seconds.")

    paths = save_and_plot_results(results, output_dir="d:\\autonomous\\data")
    print("\nArtifacts saved successfully:")
    for k, v in paths.items():
        print(f"  - {k}: {v}")

    print("\n" + "=" * 70)
    print("EXPERIMENTAL SUMMARY TABLE")
    print("=" * 70)
    print(f"{'p':<8} | {'Strategyproof %':<18} | {'T5.4 Satisfied %':<18} | {'T5.4 Sat & SP Fail (Must be 0)':<30}")
    print("-" * 80)
    for p_str, s in results["p_summaries"].items():
        sp_pct = f"{s['strategyproof_percentage']}% ({s['strategyproof_count']}/{s['total_instances']})"
        t54_pct = f"{s['t5_4_satisfied_percentage']}% ({s['t5_4_satisfied_count']}/{s['total_instances']})"
        impossible = s["categories"].get("T5.4 Satisfied & Not Strategyproof", 0)
        print(f"{p_str:<8} | {sp_pct:<18} | {t54_pct:<18} | {impossible:<30}")

    print("\nDetailed Category Breakdown:")
    for p_str, s in results["p_summaries"].items():
        print(f"\np = {p_str}:")
        for cat, cnt in s["categories"].items():
            pct = (cnt / s["total_instances"]) * 100
            print(f"  - {cat:<36}: {cnt:>4} ({pct:5.1f}%)")


if __name__ == "__main__":
    main()
