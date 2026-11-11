"""Argumentation Engine Package."""

from backend.engine.framework import ArgumentationFramework
from backend.engine.strategic import MultiAgentArgumentation
from backend.engine.presets import PRESET_FRAMEWORKS
from backend.engine.experiments import (
    generate_random_instance,
    evaluate_single_instance,
    run_experiment_suite,
    save_and_plot_results,
)

__all__ = [
    "ArgumentationFramework",
    "MultiAgentArgumentation",
    "PRESET_FRAMEWORKS",
    "generate_random_instance",
    "evaluate_single_instance",
    "run_experiment_suite",
    "save_and_plot_results",
]
