"""Unit tests for the Random Experiment Engine."""

import os
import pytest
from backend.engine.experiments import (
    generate_random_instance,
    evaluate_single_instance,
    run_experiment_suite,
    save_and_plot_results,
)


def test_random_instance_generator():
    """Verify instance generation constraints: 3 agents, 6-8 arguments, disjoint ownership."""
    af, ownership = generate_random_instance(num_agents=3, num_args_range=(6, 8), p=0.25)

    assert 6 <= len(af.arguments) <= 8
    assert len(ownership) == 3

    all_assigned = set()
    for aid, args in ownership.items():
        assert len(args) >= 1  # each agent gets arguments
        assert all_assigned.isdisjoint(set(args))  # disjoint
        all_assigned.update(args)

    assert all_assigned == af.arguments


def test_experiment_suite_and_export(tmp_path):
    """Run a small experiment batch and check CSV, JSON, and chart generation."""
    suite = run_experiment_suite(probabilities=[0.15, 0.25], instances_per_p=20, seed=42)

    assert suite["metadata"]["total_instances"] == 40
    assert "0.15" in suite["p_summaries"]
    assert "0.25" in suite["p_summaries"]

    # Verify no violation of sufficiency
    for p_str, summary in suite["p_summaries"].items():
        assert summary["categories"]["T5.4 Satisfied & Not Strategyproof"] == 0

    out_dir = str(tmp_path / "data")
    paths = save_and_plot_results(suite, output_dir=out_dir)

    assert os.path.exists(paths["csv"])
    assert os.path.exists(paths["json"])
    assert os.path.exists(paths["chart_sp"])
    assert os.path.exists(paths["chart_comp"])
    assert os.path.exists(paths["chart_dist"])
