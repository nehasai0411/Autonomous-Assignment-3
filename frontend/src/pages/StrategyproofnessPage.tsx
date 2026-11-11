import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { GraphViewer } from '../components/GraphViewer';
import { useFramework } from '../context/FrameworkContext';
import { api } from '../services/api';
import { CompareTheoremsResponse, ViolatingPath } from '../types';

export const StrategyproofnessPage: React.FC = () => {
  const { framework, agentOwnership } = useFramework();

  const [compareResult, setCompareResult] = useState<CompareTheoremsResponse | null>(null);
  const [selectedPath, setSelectedPath] = useState<string[] | undefined>(undefined);
  const [selectedViolatingPair, setSelectedViolatingPair] = useState<ViolatingPath | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const res = await api.compareTheorems(framework, agentOwnership);
      setCompareResult(res);
      if (res.theorem_5_4.violating_pairs.length > 0) {
        setSelectedViolatingPair(res.theorem_5_4.violating_pairs[0]);
        setSelectedPath(res.theorem_5_4.violating_pairs[0].path);
      } else {
        setSelectedViolatingPair(null);
        setSelectedPath(undefined);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleVerify();
  }, [framework, agentOwnership]);

  const selectViolation = (v: ViolatingPath) => {
    setSelectedViolatingPair(v);
    setSelectedPath(v.path);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Strategyproofness & Theorem Verification
          </h1>
          <p className="text-xs text-slate-400">
            Requirements 3 & 4: Exhaustive Theorem 5.3 strategyproofness verification & Theorem 5.4 odd-path topological condition.
          </p>
        </div>

        <button
          onClick={handleVerify}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Re-verify Theorems</span>
        </button>
      </div>

      {/* High-level Outcome Comparison Banner */}
      {compareResult && (
        <div
          className={`border rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            compareResult.is_strategyproof
              ? 'bg-emerald-950/40 border-emerald-800/80'
              : 'bg-rose-950/40 border-rose-800/80'
          }`}
        >
          <div className="flex items-start gap-3.5">
            {compareResult.is_strategyproof ? (
              <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Mechanism Status: {compareResult.is_strategyproof ? 'STRATEGYPROOF' : 'NOT STRATEGYPROOF (Vulnerable)'}
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                  {compareResult.category}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {compareResult.notes}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl text-center min-w-[120px]">
              <span className="text-slate-400 text-[10px] block">Theorem 5.3 (SP)</span>
              <span
                className={`text-sm font-bold ${
                  compareResult.is_strategyproof ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {compareResult.is_strategyproof ? 'PASSED (SP)' : 'FAILED'}
              </span>
            </div>
            <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl text-center min-w-[120px]">
              <span className="text-slate-400 text-[10px] block">Theorem 5.4 Condition</span>
              <span
                className={`text-sm font-bold ${
                  compareResult.satisfies_theorem_5_4 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {compareResult.satisfies_theorem_5_4 ? 'SATISFIED' : 'FAILED'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Graph + Violating Paths or Counterexamples */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Graph with Odd Path Highlighting (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <span>Graph & Odd-Length Directed Path Tracing</span>
            </h3>
            {selectedPath && (
              <span className="text-xs font-mono font-bold text-pink-400 bg-pink-950/60 border border-pink-800/80 px-2.5 py-1 rounded-md">
                Path: {selectedPath.join(' \u2192 ')} (Length: {selectedPath.length - 1})
              </span>
            )}
          </div>

          <GraphViewer
            argumentsList={framework.arguments}
            attacks={framework.attacks}
            agentOwnership={agentOwnership}
            highlightedPath={selectedPath}
            height="460px"
          />

          {/* Theorem 5.4 Condition Summary Box */}
          {compareResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">
                  Theorem 5.4 (Sufficiency Condition):
                </span>
                <span
                  className={`font-bold ${
                    compareResult.satisfies_theorem_5_4 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {compareResult.theorem_5_4.violations_count} odd-path violation(s)
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {compareResult.theorem_5_4.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Right: Violation Paths List or Counterexample Details (1 col) */}
        <div className="space-y-4">
          {/* Theorem 5.4 Violating Pairs List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>Theorem 5.4 Odd Paths</span>
              <span className="text-slate-400">
                {compareResult?.theorem_5_4.violations_count ?? 0} found
              </span>
            </h3>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {compareResult?.theorem_5_4.violating_pairs.map((v, idx) => {
                const isSelected =
                  selectedViolatingPair?.source === v.source &&
                  selectedViolatingPair?.target === v.target &&
                  selectedViolatingPair?.agent_id === v.agent_id;

                return (
                  <button
                    key={idx}
                    onClick={() => selectViolation(v)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs font-mono transition space-y-1 block ${
                      isSelected
                        ? 'bg-pink-950/40 border-pink-600 ring-1 ring-pink-500/50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-200 font-bold">Agent {v.agent_id}</span>
                      <span className="text-[10px] text-pink-400 font-sans font-semibold">
                        Length {v.path_length} (Odd)
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {v.path.join(' \u2192 ')}
                    </div>
                  </button>
                );
              })}

              {compareResult?.theorem_5_4.violating_pairs.length === 0 && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>No odd-length paths between same-agent arguments!</span>
                </div>
              )}
            </div>
          </div>

          {/* Theorem 5.3 Counterexamples (if not SP) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>Theorem 5.3 Counterexamples</span>
              <span className="text-slate-400">
                {compareResult?.theorem_5_3.counterexample_count ?? 0} found
              </span>
            </h3>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {compareResult?.theorem_5_3.counterexamples.map((ce, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-rose-900/60 rounded-lg p-2.5 text-xs font-mono space-y-1"
                >
                  <div className="flex items-center justify-between text-rose-400 font-bold">
                    <span>Agent {ce.agent_id}</span>
                    <span>Gain: +{ce.utility_gain} ({ce.truthful_utility} &rarr; {ce.hiding_utility})</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Hiding: <span className="text-amber-400">{ce.hidden_arguments.join(', ')}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Opponents revealed:{' '}
                    {Object.entries(ce.opponent_reports)
                      .map(([o, args]) => `${o}: {${args.join(', ')}}`)
                      .join(' | ')}
                  </div>
                </div>
              ))}

              {compareResult?.theorem_5_3.counterexamples.length === 0 && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Truthful revelation is weakly dominant against all profiles!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
