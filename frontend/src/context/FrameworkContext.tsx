import React, { createContext, useContext, useEffect, useState } from 'react';
import { AnalysisResponse, Framework, AgentOwnership, PresetFramework } from '../types';
import { api } from '../services/api';

interface FrameworkContextType {
  framework: Framework;
  agentOwnership: AgentOwnership;
  presets: Record<string, PresetFramework>;
  activePresetId: string | null;
  analysis: AnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
  loadPreset: (presetId: string) => void;
  setFramework: (framework: Framework) => void;
  setAgentOwnership: (ownership: AgentOwnership) => void;
  addArgument: (name: string, agentId?: string) => void;
  removeArgument: (name: string) => void;
  addAttack: (attacker: string, target: string) => void;
  removeAttack: (attacker: string, target: string) => void;
  assignArgumentToAgent: (argument: string, agentId: string) => void;
  createAgent: (agentId: string) => void;
  deleteAgent: (agentId: string) => void;
  refreshAnalysis: () => Promise<void>;
}

const FrameworkContext = createContext<FrameworkContextType | undefined>(undefined);

export const FrameworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [framework, setFrameworkState] = useState<Framework>({
    arguments: ['a1', 'a2', 'a3', 'a4', 'a5'],
    attacks: [
      ['a1', 'a2'],
      ['a2', 'a3'],
      ['a3', 'a4'],
      ['a3', 'a5'],
    ],
  });

  const [agentOwnership, setAgentOwnershipState] = useState<AgentOwnership>({
    x: ['a1', 'a4', 'a5'],
    y: ['a2'],
    z: ['a3'],
  });

  const [presets, setPresets] = useState<Record<string, PresetFramework>>({});
  const [activePresetId, setActivePresetId] = useState<string | null>('example_5_10');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load presets on initial mount
  useEffect(() => {
    api
      .getPresets()
      .then((res) => {
        setPresets(res.presets);
      })
      .catch((err) => {
        console.error('Failed to load presets:', err);
      });
  }, []);

  // Trigger analysis whenever framework changes
  const refreshAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.analyzeFramework(framework);
      setAnalysis(res);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAnalysis();
  }, [framework]);

  const loadPreset = (presetId: string) => {
    const preset = presets[presetId];
    if (!preset) return;
    setActivePresetId(presetId);
    setFrameworkState({
      arguments: [...preset.arguments],
      attacks: preset.attacks.map((att) => [att[0], att[1]]),
    });
    setAgentOwnershipState({ ...preset.agents });
  };

  const setFramework = (newFw: Framework) => {
    setActivePresetId(null);
    setFrameworkState(newFw);

    // Prune agent ownership to only arguments present
    const validArgs = new Set(newFw.arguments);
    setAgentOwnershipState((prev) => {
      const updated: AgentOwnership = {};
      for (const [aid, args] of Object.entries(prev)) {
        updated[aid] = args.filter((a) => validArgs.has(a));
      }
      return updated;
    });
  };

  const setAgentOwnership = (ownership: AgentOwnership) => {
    setAgentOwnershipState(ownership);
  };

  const addArgument = (name: string, agentId?: string) => {
    const trimmed = name.trim();
    if (!trimmed || framework.arguments.includes(trimmed)) return;
    setActivePresetId(null);
    setFrameworkState((prev) => ({
      ...prev,
      arguments: [...prev.arguments, trimmed],
    }));

    if (agentId) {
      setAgentOwnershipState((prev) => ({
        ...prev,
        [agentId]: [...(prev[agentId] || []), trimmed],
      }));
    } else {
      // Default to first agent if exists
      const firstAgent = Object.keys(agentOwnership)[0];
      if (firstAgent) {
        setAgentOwnershipState((prev) => ({
          ...prev,
          [firstAgent]: [...(prev[firstAgent] || []), trimmed],
        }));
      }
    }
  };

  const removeArgument = (name: string) => {
    setActivePresetId(null);
    setFrameworkState((prev) => ({
      arguments: prev.arguments.filter((a) => a !== name),
      attacks: prev.attacks.filter(([u, v]) => u !== name && v !== name),
    }));

    setAgentOwnershipState((prev) => {
      const updated: AgentOwnership = {};
      for (const [aid, args] of Object.entries(prev)) {
        updated[aid] = args.filter((a) => a !== name);
      }
      return updated;
    });
  };

  const addAttack = (attacker: string, target: string) => {
    if (!attacker || !target) return;
    if (framework.attacks.some(([u, v]) => u === attacker && v === target)) return;
    setActivePresetId(null);
    setFrameworkState((prev) => ({
      ...prev,
      attacks: [...prev.attacks, [attacker, target]],
    }));
  };

  const removeAttack = (attacker: string, target: string) => {
    setActivePresetId(null);
    setFrameworkState((prev) => ({
      ...prev,
      attacks: prev.attacks.filter(([u, v]) => !(u === attacker && v === target)),
    }));
  };

  const assignArgumentToAgent = (argument: string, targetAgentId: string) => {
    setAgentOwnershipState((prev) => {
      const updated: AgentOwnership = {};
      for (const [aid, args] of Object.entries(prev)) {
        updated[aid] = args.filter((a) => a !== argument);
      }
      if (!updated[targetAgentId]) {
        updated[targetAgentId] = [];
      }
      updated[targetAgentId].push(argument);
      return updated;
    });
  };

  const createAgent = (agentId: string) => {
    const trimmed = agentId.trim();
    if (!trimmed || agentOwnership[trimmed]) return;
    setAgentOwnershipState((prev) => ({
      ...prev,
      [trimmed]: [],
    }));
  };

  const deleteAgent = (agentId: string) => {
    setAgentOwnershipState((prev) => {
      const updated = { ...prev };
      delete updated[agentId];
      return updated;
    });
  };

  return (
    <FrameworkContext.Provider
      value={{
        framework,
        agentOwnership,
        presets,
        activePresetId,
        analysis,
        isLoading,
        error,
        loadPreset,
        setFramework,
        setAgentOwnership,
        addArgument,
        removeArgument,
        addAttack,
        removeAttack,
        assignArgumentToAgent,
        createAgent,
        deleteAgent,
        refreshAnalysis,
      }}
    >
      {children}
    </FrameworkContext.Provider>
  );
};

export const useFramework = () => {
  const context = useContext(FrameworkContext);
  if (!context) {
    throw new Error('useFramework must be used within a FrameworkProvider');
  }
  return context;
};
