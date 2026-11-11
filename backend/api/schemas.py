"""Pydantic schemas for the Argumentation Engine API."""

from typing import Any, Dict, List, Optional, Tuple
from pydantic import BaseModel, Field


class FrameworkModel(BaseModel):
    """Argumentation framework representation."""
    arguments: List[str] = Field(..., description="List of argument identifiers")
    attacks: List[Tuple[str, str]] = Field(..., description="List of directed attacks (attacker, target)")


class SetCheckRequest(BaseModel):
    """Request to test properties of a given set of arguments."""
    framework: FrameworkModel
    argument_set: List[str]


class DefenceCheckRequest(BaseModel):
    """Request to test if an argument is defended by a set."""
    framework: FrameworkModel
    argument_set: List[str]
    argument: str


class AcceptanceRequest(BaseModel):
    """Request to evaluate the acceptance status of an argument."""
    framework: FrameworkModel
    argument: str
    semantics: str = Field("grounded", description="grounded | complete | preferred | stable | semi_stable")


class MultiAgentModel(BaseModel):
    """Multi-agent framework setup."""
    framework: FrameworkModel
    agent_ownership: Dict[str, List[str]] = Field(
        ..., description="Map of agent_id -> list of owned arguments"
    )


class StrategicMechanismRequest(BaseModel):
    """Request to run the grounded direct mechanism."""
    framework: FrameworkModel
    agent_ownership: Dict[str, List[str]]
    revealed_reports: Dict[str, List[str]] = Field(
        ..., description="Map of agent_id -> revealed argument subset"
    )


class BestReportsRequest(BaseModel):
    """Request to find best reports for an agent against fixed opponent reports."""
    framework: FrameworkModel
    agent_ownership: Dict[str, List[str]]
    target_agent: str
    fixed_opponent_reports: Dict[str, List[str]]


class ExperimentRunRequest(BaseModel):
    """Request to run a batch of random experiments."""
    probabilities: List[float] = Field(default=[0.15, 0.25, 0.35])
    instances_per_p: int = Field(default=1000, ge=10, le=5000)
    seed: int = Field(default=42)
    allow_self_attacks: bool = Field(default=False)
