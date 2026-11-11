"""FastAPI routes for Argumentation Engine and Strategic Argumentation."""

import json
import os
from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from backend.api.schemas import (
    AcceptanceRequest,
    BestReportsRequest,
    DefenceCheckRequest,
    ExperimentRunRequest,
    FrameworkModel,
    MultiAgentModel,
    SetCheckRequest,
    StrategicMechanismRequest,
)
from backend.engine.experiments import run_experiment_suite, save_and_plot_results
from backend.engine.framework import ArgumentationFramework
from backend.engine.presets import PRESET_FRAMEWORKS
from backend.engine.strategic import MultiAgentArgumentation

router = APIRouter(prefix="/api")

DATA_DIR = os.path.abspath("d:/autonomous/data")


# -----------------------------------------------------------------------------
# Framework & Engine Endpoints (Part A)
# -----------------------------------------------------------------------------

@router.get("/presets")
def get_presets() -> Dict[str, Any]:
    """Return all predefined frameworks and book examples."""
    return {"presets": PRESET_FRAMEWORKS}


@router.post("/framework/analyze")
def analyze_framework(req: FrameworkModel) -> Dict[str, Any]:
    """Compute all extensions, iteration log for grounded, and legal labellings."""
    af = ArgumentationFramework(req.arguments, req.attacks)

    grounded_ext, grounded_log = af.get_grounded_extension()
    complete_exts = af.get_complete_extensions()
    preferred_exts = af.get_preferred_extensions()
    stable_exts = af.get_stable_extensions()
    semi_stable_exts = af.get_semi_stable_extensions()
    labellings = af.get_legal_labellings()

    return {
        "arguments": sorted(list(af.arguments)),
        "attacks": sorted(list(af.attacks)),
        "extensions": {
            "grounded": [sorted(list(grounded_ext))],
            "complete": [sorted(list(s)) for s in complete_exts],
            "preferred": [sorted(list(s)) for s in preferred_exts],
            "stable": [sorted(list(s)) for s in stable_exts],
            "semi_stable": [sorted(list(s)) for s in semi_stable_exts],
        },
        "grounded_iteration_log": grounded_log,
        "legal_labellings": labellings,
        "counts": {
            "arguments": len(af.arguments),
            "attacks": len(af.attacks),
            "complete": len(complete_exts),
            "preferred": len(preferred_exts),
            "stable": len(stable_exts),
            "semi_stable": len(semi_stable_exts),
            "labellings": len(labellings),
        },
    }


@router.post("/framework/check-set")
def check_set(req: SetCheckRequest) -> Dict[str, Any]:
    """Check conflict-free, admissibility, and complete extension status for a set."""
    af = ArgumentationFramework(req.framework.arguments, req.framework.attacks)
    S = set(req.argument_set)

    is_cf = af.is_conflict_free(S)
    is_adm = af.is_admissible(S)
    is_comp = af.is_complete_extension(S)
    is_stable = af.is_stable_extension(S)
    char_func = af.characteristic_function(S)
    range_set = af.range_of(S)

    return {
        "argument_set": sorted(list(S)),
        "is_conflict_free": is_cf,
        "is_admissible": is_adm,
        "is_complete_extension": is_comp,
        "is_stable_extension": is_stable,
        "characteristic_function": sorted(list(char_func)),
        "range_plus": sorted(list(range_set)),
        "defends_all_elements": S.issubset(char_func),
        "fixed_point_of_characteristic": char_func == S,
    }


@router.post("/framework/check-defence")
def check_defence(req: DefenceCheckRequest) -> Dict[str, Any]:
    """Test if set S defends argument alpha."""
    af = ArgumentationFramework(req.framework.arguments, req.framework.attacks)
    S = set(req.argument_set)
    alpha = req.argument

    defended = af.defends(S, alpha)
    attackers = af.attackers_of(alpha)
    attacker_counterattacks = {
        att: sorted(list(af.attackers_of(att) & S)) for att in attackers
    }

    return {
        "argument": alpha,
        "argument_set": sorted(list(S)),
        "is_defended": defended,
        "attackers_of_argument": sorted(list(attackers)),
        "attacker_defenders_in_set": attacker_counterattacks,
    }


@router.post("/framework/acceptance")
def check_acceptance(req: AcceptanceRequest) -> Dict[str, Any]:
    """Evaluate acceptance status of an argument under specified semantics."""
    af = ArgumentationFramework(req.framework.arguments, req.framework.attacks)
    try:
        res = af.get_acceptance_status(req.argument, req.semantics)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# -----------------------------------------------------------------------------
# Strategic Argumentation Endpoints (Part B)
# -----------------------------------------------------------------------------

@router.post("/strategic/mechanism")
def run_mechanism(req: StrategicMechanismRequest) -> Dict[str, Any]:
    """Run grounded direct argumentation mechanism on revealed reports."""
    af = ArgumentationFramework(req.framework.arguments, req.framework.attacks)
    ma = MultiAgentArgumentation(af, req.agent_ownership)

    grounded_ext, log = ma.grounded_mechanism(req.revealed_reports)
    utilities = ma.compute_all_utilities(req.revealed_reports)

    revealed_union = set()
    for report in req.revealed_reports.values():
        revealed_union.update(report)

    return {
        "revealed_reports": {k: sorted(list(v)) for k, v in req.revealed_reports.items()},
        "revealed_union": sorted(list(revealed_union)),
        "grounded_extension": sorted(list(grounded_ext)),
        "grounded_iteration_log": log,
        "utilities": utilities,
        "accepted_per_agent": {
            aid: sorted(list(ma.get_owned_arguments(aid) & grounded_ext))
            for aid in ma.agent_ids
        },
    }


@router.post("/strategic/best-reports")
def find_best_reports(req: BestReportsRequest) -> Dict[str, Any]:
    """Enumerate all reports for target agent and return utility-maximizing reports."""
    af = ArgumentationFramework(req.framework.arguments, req.framework.attacks)
    ma = MultiAgentArgumentation(af, req.agent_ownership)

    if req.target_agent not in ma.agent_ids:
        raise HTTPException(status_code=400, detail=f"Target agent '{req.target_agent}' not in agent ownership.")

    return ma.get_best_reports(req.target_agent, req.fixed_opponent_reports)


@router.post("/strategic/verify-t53")
def verify_theorem_5_3(req: MultiAgentModel) -> Dict[str, Any]:
    """Verify Theorem 5.3 strategyproofness and return all counterexamples."""
    af = ArgumentationFramework(req.framework.arguments, req.framework.attacks)
    ma = MultiAgentArgumentation(af, req.agent_ownership)
    return ma.verify_theorem_5_3_strategyproofness()


@router.post("/strategic/verify-t54")
def verify_theorem_5_4(req: MultiAgentModel) -> Dict[str, Any]:
    """Verify Theorem 5.4 odd-length directed path condition with parity BFS."""
    af = ArgumentationFramework(req.framework.arguments, req.framework.attacks)
    ma = MultiAgentArgumentation(af, req.agent_ownership)
    return ma.verify_theorem_5_4_condition()


@router.post("/strategic/compare")
def compare_strategic_theorems(req: MultiAgentModel) -> Dict[str, Any]:
    """Run both T5.3 and T5.4 and report comparative outcome."""
    af = ArgumentationFramework(req.framework.arguments, req.framework.attacks)
    ma = MultiAgentArgumentation(af, req.agent_ownership)
    return ma.compare_theorems()


# -----------------------------------------------------------------------------
# Random Experiments Endpoints
# -----------------------------------------------------------------------------

@router.get("/experiments/results")
def get_experiment_results() -> Dict[str, Any]:
    """Return precomputed or current experiment results."""
    json_path = os.path.join(DATA_DIR, "experiments_results.json")
    if not os.path.exists(json_path):
        raise HTTPException(status_code=404, detail="No experiment results found. Run experiments first.")

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


@router.post("/experiments/run")
def run_experiments_api(req: ExperimentRunRequest) -> Dict[str, Any]:
    """Run custom or standard experiments batch via API."""
    results = run_experiment_suite(
        probabilities=req.probabilities,
        instances_per_p=req.instances_per_p,
        seed=req.seed,
        allow_self_attacks=req.allow_self_attacks,
    )
    save_and_plot_results(results, output_dir=DATA_DIR)
    return {
        "metadata": results["metadata"],
        "p_summaries": results["p_summaries"],
        "sample_records": results["all_records"][:100],
    }


@router.get("/experiments/download/csv")
def download_csv():
    """Download the experiment results as CSV."""
    csv_path = os.path.join(DATA_DIR, "experiments_results.csv")
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=404, detail="CSV file not found.")
    return FileResponse(csv_path, media_type="text/csv", filename="experiments_results.csv")


@router.get("/experiments/download/json")
def download_json():
    """Download the experiment results as JSON."""
    json_path = os.path.join(DATA_DIR, "experiments_results.json")
    if not os.path.exists(json_path):
        raise HTTPException(status_code=404, detail="JSON file not found.")
    return FileResponse(json_path, media_type="application/json", filename="experiments_results.json")


@router.get("/experiments/chart/{chart_name}")
def get_chart_image(chart_name: str):
    """Serve generated Matplotlib chart image."""
    valid_charts = {
        "strategyproofness_by_p": "strategyproofness_by_p.png",
        "theorem_comparison": "theorem_comparison.png",
        "outcome_distribution": "outcome_distribution.png",
    }
    filename = valid_charts.get(chart_name)
    if not filename:
        raise HTTPException(status_code=404, detail="Chart not found")

    chart_path = os.path.join(DATA_DIR, "charts", filename)
    if not os.path.exists(chart_path):
        raise HTTPException(status_code=404, detail=f"Chart image '{filename}' not generated yet.")

    return FileResponse(chart_path, media_type="image/png")
