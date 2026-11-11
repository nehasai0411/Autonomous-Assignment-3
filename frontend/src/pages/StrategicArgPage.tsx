import React, { useEffect, useState } from 'react';
import {
  Award,
  CheckSquare,
  Eye,
  EyeOff,
  Play,
  RotateCcw,
  Sparkles,
  Users,
} from 'lucide-react';
import { GraphViewer } from '../components/GraphViewer';
import { useFramework } from '../context/FrameworkContext';
import { api } from '../services/api';
import { StrategicMechanismResponse } from '../types';

export const StrategicArgPage: React.FC = () => {
  const { framework, agentOwnership, activePresetId } = useFramework();

  // Revealed arguments per agent (defaults to truthful revelation)
  const [revealedReports, setRevealedReports] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<StrategicMechanismResponse | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Initialize with truthful reports when agent ownership changes
  useEffect(() => {
    const truthful: Record<string, string[]> = {};
    for (const [aid, args] of Object.entries(agentOwnership)) {
      truthful[aid] = [...args];
    }
    setRevealedReports(truthful);
  }, [agentOwnership]);

  const toggleArgRevelation = (agentId: string, arg: string) => {
    setRevealedReports((prev) => {
      const current = prev[agentId] || [];
      const updated = current.includes(arg)
        ? current.filter((a) => a !== arg)
        : [...current, arg];
      return { ...prev, [agentId]: updated };
    });
  };

  const setAllTruthful = () => {
    const truthful: Record<string, string[]> = {};
    for (const [aid, args] of Object.entries(agentOwnership)) {
      truthful[aid] = [...args];
    }
    setRevealedReports(truthful);
  };

  const handleRunMechanism = async () => {
    setIsRunning(true);
    try {
      const res = await api.runMechanism(framework, agentOwnership, revealedReports);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  // Run on mount or when reports change
  useEffect(() => {
    if (Object.keys(revealedReports).length > 0) {
      handleRunMechanism();
    }
  }, [revealedReports]);

  const allRevealedArgs = Object.values(revealedReports).flat();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Strategic Argumentation Mechanism
          </h1>
          <p className="text-xs text-slate-400">
            Requirement 1 & 2: Grounded Direct Mechanism with strategic hiding and utility calculation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={setAllTruthful}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Truthful</span>
          </button>
          <button
            onClick={handleRunMechanism}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Evaluate Mechanism</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Graph Visualization (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <span>Induced Argument Graph AF[A&deg;]</span>
            </h3>
            <span className="text-xs text-slate-400">
              Hidden arguments are faded & dashed • Green border = in Grounded Extension
            </span>
          </div>

          <GraphViewer
            argumentsList={framework.arguments}
            attacks={framework.attacks}
            agentOwnership={agentOwnership}
            revealedArguments={allRevealedArgs}
            groundedExtension={result?.grounded_extension}
            height="460px"
          />

          {/* Utility Summary Cards */}
          {result && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(result.utilities).map(([aid, util]) => {
                const owned = agentOwnership[aid] || [];
                const accepted = result.accepted_per_agent[aid] || [];
                return (
                  <div
                    key={aid}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">Agent {aid}</span>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded">
                        Utility: {util} / {owned.length}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-1">
                      <div>
                        Owned: <span className="font-mono text-slate-300">{owned.join(', ') || '∅'}</span>
                      </div>
                      <div>
                        Revealed:{' '}
                        <span className="font-mono text-slate-300">
                          {revealedReports[aid]?.join(', ') || '∅ (All Hidden)'}
                        </span>
                      </div>
                      <div className="text-emerald-400 font-semibold">
                        Accepted in GE: {accepted.join(', ') || 'None'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Agent Reports Controller (1 col) */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Strategic Revelations (A_i&deg;)
              </h3>
            </div>

            <p className="text-xs text-slate-400">
              Toggle arguments to reveal or hide them. The mechanism computes the grounded extension
              over only the revealed arguments.
            </p>

            <div className="space-y-4">
              {Object.entries(agentOwnership).map(([aid, ownedArgs]) => {
                const currentRevealed = revealedReports[aid] || [];

                return (
                  <div
                    key={aid}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        <span className="text-xs font-bold text-slate-100">Agent {aid}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Revealing {currentRevealed.length} of {ownedArgs.length}
                      </span>
                    </div>

                    {/* Checkbox pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {ownedArgs.map((arg) => {
                        const isRevealed = currentRevealed.includes(arg);
                        return (
                          <button
                            key={arg}
                            onClick={() => toggleArgRevelation(aid, arg)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold transition border ${
                              isRevealed
                                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                                : 'bg-slate-900 border-slate-800 text-slate-500 line-through'
                            }`}
                          >
                            {isRevealed ? (
                              <Eye className="w-3 h-3 text-indigo-400" />
                            ) : (
                              <EyeOff className="w-3 h-3 text-slate-500" />
                            )}
                            <span>{arg}</span>
                          </button>
                        );
                      })}
                      {ownedArgs.length === 0 && (
                        <span className="text-xs text-slate-500 italic">No arguments owned.</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Example 5.10 Demonstration Shortcut */}
            {activePresetId === 'example_5_10' && (
              <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-3.5 text-xs text-indigo-200 space-y-2">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Try Example 5.10 Hiding Manipulation:
                </div>
                <p className="text-[11px] text-indigo-300/80 leading-relaxed">
                  In Example 5.10, Agent x owns {'{a1, a4, a5}'}. When truthful, u_x = 1.
                  Click below to hide a1 and observe utility jump to 2!
                </p>
                <button
                  onClick={() => {
                    setRevealedReports({
                      x: ['a4', 'a5'], // a1 hidden
                      y: ['a2'],
                      z: ['a3'],
                    });
                  }}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold text-xs transition"
                >
                  Hide a1 (Agent x gains u_x = 2)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
