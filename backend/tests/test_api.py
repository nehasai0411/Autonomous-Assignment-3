"""Integration tests for FastAPI endpoints."""

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


def test_presets():
    res = client.get("/api/presets")
    assert res.status_code == 200
    presets = res.json()["presets"]
    assert "example_5_10" in presets
    assert "example_5_11" in presets


def test_framework_analyze():
    payload = {
        "arguments": ["a", "b", "c"],
        "attacks": [["a", "b"], ["b", "c"]],
    }
    res = client.post("/api/framework/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["extensions"]["grounded"] == [["a", "c"]]
    assert len(data["extensions"]["complete"]) >= 1


def test_check_set_and_defence():
    payload = {
        "framework": {
            "arguments": ["a", "b", "c"],
            "attacks": [["a", "b"], ["b", "c"]],
        },
        "argument_set": ["a", "c"],
    }
    res = client.post("/api/framework/check-set", json=payload)
    assert res.status_code == 200
    assert res.json()["is_conflict_free"] is True
    assert res.json()["is_complete_extension"] is True

    defence_payload = {
        "framework": {
            "arguments": ["a", "b", "c"],
            "attacks": [["a", "b"], ["b", "c"]],
        },
        "argument_set": ["a"],
        "argument": "c",
    }
    res_def = client.post("/api/framework/check-defence", json=defence_payload)
    assert res_def.status_code == 200
    assert res_def.json()["is_defended"] is True


def test_strategic_endpoints():
    payload = {
        "framework": {
            "arguments": ["a1", "a2", "a3", "a4", "a5"],
            "attacks": [["a1", "a2"], ["a2", "a3"], ["a3", "a4"], ["a3", "a5"]],
        },
        "agent_ownership": {
            "x": ["a1", "a4", "a5"],
            "y": ["a2"],
            "z": ["a3"],
        },
        "revealed_reports": {
            "x": ["a1", "a4", "a5"],
            "y": ["a2"],
            "z": ["a3"],
        },
    }
    res = client.post("/api/strategic/mechanism", json=payload)
    assert res.status_code == 200
    assert res.json()["utilities"]["x"] == 1

    # Verify Theorem 5.3
    t53_payload = {
        "framework": payload["framework"],
        "agent_ownership": payload["agent_ownership"],
    }
    res_t53 = client.post("/api/strategic/verify-t53", json=t53_payload)
    assert res_t53.status_code == 200
    assert res_t53.json()["is_strategyproof"] is False

    # Verify Theorem 5.4
    res_t54 = client.post("/api/strategic/verify-t54", json=t53_payload)
    assert res_t54.status_code == 200
    assert res_t54.json()["satisfies_condition"] is False


def test_experiment_endpoints():
    res = client.get("/api/experiments/results")
    assert res.status_code == 200
    data = res.json()
    assert "p_summaries" in data
    assert "0.15" in data["p_summaries"]
    assert "0.25" in data["p_summaries"]
    assert "0.35" in data["p_summaries"]

    # Test downloading CSV
    res_csv = client.get("/api/experiments/download/csv")
    assert res_csv.status_code == 200
    assert "text/csv" in res_csv.headers["content-type"]

    # Test getting chart image
    res_chart = client.get("/api/experiments/chart/strategyproofness_by_p")
    assert res_chart.status_code == 200
    assert "image/png" in res_chart.headers["content-type"]
