import {
  AcceptanceResponse,
  AnalysisResponse,
  BestReportsResponse,
  CompareTheoremsResponse,
  DefenceCheckResponse,
  ExperimentsResult,
  Framework,
  PresetFramework,
  SetCheckResponse,
  StrategicMechanismResponse,
  Theorem53Response,
  Theorem54Response,
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    let detail = errorText;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.detail) detail = parsed.detail;
    } catch {}
    throw new Error(detail || `HTTP Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  getPresets: async (): Promise<{ presets: Record<string, PresetFramework> }> => {
    return fetchJson('/presets');
  },

  analyzeFramework: async (framework: Framework): Promise<AnalysisResponse> => {
    return fetchJson('/framework/analyze', {
      method: 'POST',
      body: JSON.stringify(framework),
    });
  },

  checkSet: async (framework: Framework, argumentSet: string[]): Promise<SetCheckResponse> => {
    return fetchJson('/framework/check-set', {
      method: 'POST',
      body: JSON.stringify({
        framework,
        argument_set: argumentSet,
      }),
    });
  },

  checkDefence: async (
    framework: Framework,
    argumentSet: string[],
    argument: string
  ): Promise<DefenceCheckResponse> => {
    return fetchJson('/framework/check-defence', {
      method: 'POST',
      body: JSON.stringify({
        framework,
        argument_set: argumentSet,
        argument,
      }),
    });
  },

  checkAcceptance: async (
    framework: Framework,
    argument: string,
    semantics: string
  ): Promise<AcceptanceResponse> => {
    return fetchJson('/framework/acceptance', {
      method: 'POST',
      body: JSON.stringify({
        framework,
        argument,
        semantics,
      }),
    });
  },

  runMechanism: async (
    framework: Framework,
    agentOwnership: Record<string, string[]>,
    revealedReports: Record<string, string[]>
  ): Promise<StrategicMechanismResponse> => {
    return fetchJson('/strategic/mechanism', {
      method: 'POST',
      body: JSON.stringify({
        framework,
        agent_ownership: agentOwnership,
        revealed_reports: revealedReports,
      }),
    });
  },

  findBestReports: async (
    framework: Framework,
    agentOwnership: Record<string, string[]>,
    targetAgent: string,
    fixedOpponentReports: Record<string, string[]>
  ): Promise<BestReportsResponse> => {
    return fetchJson('/strategic/best-reports', {
      method: 'POST',
      body: JSON.stringify({
        framework,
        agent_ownership: agentOwnership,
        target_agent: targetAgent,
        fixed_opponent_reports: fixedOpponentReports,
      }),
    });
  },

  verifyTheorem53: async (
    framework: Framework,
    agentOwnership: Record<string, string[]>
  ): Promise<Theorem53Response> => {
    return fetchJson('/strategic/verify-t53', {
      method: 'POST',
      body: JSON.stringify({
        framework,
        agent_ownership: agentOwnership,
      }),
    });
  },

  verifyTheorem54: async (
    framework: Framework,
    agentOwnership: Record<string, string[]>
  ): Promise<Theorem54Response> => {
    return fetchJson('/strategic/verify-t54', {
      method: 'POST',
      body: JSON.stringify({
        framework,
        agent_ownership: agentOwnership,
      }),
    });
  },

  compareTheorems: async (
    framework: Framework,
    agentOwnership: Record<string, string[]>
  ): Promise<CompareTheoremsResponse> => {
    return fetchJson('/strategic/compare', {
      method: 'POST',
      body: JSON.stringify({
        framework,
        agent_ownership: agentOwnership,
      }),
    });
  },

  getExperimentResults: async (): Promise<ExperimentsResult> => {
    return fetchJson('/experiments/results');
  },

  runExperiments: async (params: {
    probabilities: number[];
    instances_per_p: number;
    seed: number;
    allow_self_attacks: boolean;
  }): Promise<ExperimentsResult> => {
    return fetchJson('/experiments/run', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};
