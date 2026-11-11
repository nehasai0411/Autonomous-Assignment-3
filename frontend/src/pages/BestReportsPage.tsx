import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle,
  GitBranch,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  XCircle,
} from 'lucide-react';
import { useFramework } from '../context/FrameworkContext';
import { api } from '../services/api';
import { BestReportsResponse } from '../types';

export const BestReportsPage: React.FC = () => {
  const { framework, agentOwnership } = useFramework();

  const agentIds = Object.keys(agentOwnership);
  const [targetAgent, setTargetAgent] = useState<string>(agentIds[0] || '');

  // Fixed reports of opponents (defaults to truthfulness)
  const [opponentReports, setOpponentReports] = useState<Record<string, string[]>>({});
  const [result, setResult] = useState<BestReportsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (agentIds.length > 0 && !agentIds.includes(targetAgent)) {
      setTargetAgent(agentIds[0]);
    }
  }, [agentOwnership]);

  // Setup default opponent reports
  useEffect(() => {
    const opp: Record<string, string[]> = {};
    for (const [aid, args] of Object.entries(agentOwnership)) {
      if (aid !== targetAgent) {
        opp[aid] = [...args];
      }
    }
    setOpponentReports(opp);
  }, [targetAgent, agentOwnership]);

  const toggleOpponentArg = (agentId: string, arg: string) => {
    setOpponentReports((prev) => {
      const current = prev[agentId] || [];
      const updated = current.includes(arg)
        ? current.filter((a) => a !== arg)
        : [...current, arg];
      return { ...prev, [agentId]: updated };
    });
  };

  const handleComputeBestReports = async () => {
    if (!targetAgent) return;
    setIsLoading(true);
    try {
      const res = await api.findBestReports(
        framework,
        agentOwnership,
        targetAgent,
        opponentReports
      );
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (targetAgent) {
      handleComputeBestReports();
    }
  }, [targetAgent, opponentReports]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Best Reports Analysis</h1>
        <p className="text-xs text-slate-400">
          Requirement 2: Enumerate all 2^|A_i| revelation subsets for agent i and identify utility-maximizing strategies.
        </p>
      </div>

      {/* Target Agent & Opponent Fixed Reports Config */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Select Evaluating Agent (i):
            </label>
            <div className="flex flex-wrap gap-2">
              {agentIds.map((aid) => (
                <button
                  key={aid}
                  onClick={() => setTargetAgent(aid)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                    targetAgent === aid
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Agent {aid} ({agentOwnership[aid]?.length ?? 0} args)
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleComputeBestReports}
            disabled={isLoading}
            className="self-end px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Re-evaluate Strategies</span>
          </button>
        </div>

        {/* Fixed Opponents Revelation Config */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Fixed Opponent Reports Profile (A_&minus;i&deg;):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(opponentReports).map(([aid, currentArgs]) => {
              const fullOwned = agentOwnership[aid] || [];
              return (
                <div key={aid} className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Agent {aid}</span>
                    <span className="text-[10px] text-slate-400">
                      {currentArgs.length} / {fullOwned.length} revealed
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {fullOwned.map((arg) => {
                      const isRev = currentArgs.includes(arg);
                      return (
                        <button
                          key={arg}
                          onClick={() => toggleOpponentArg(aid, arg)}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition ${
                            isRev
                              ? 'bg-indigo-950/60 border-indigo-800 text-indigo-300'
                              : 'bg-slate-900 border-slate-800 text-slate-500 line-through'
                          }`}
                        >
                          {arg}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results & Truthfulness Status Card */}
      {result && (
        <div className="space-y-6">
          {/* Truthfulness Banner */}
          <div
            className={`border rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              result.can_strictly_gain_by_hiding
                ? 'bg-amber-950/40 border-amber-800/80 text-amber-200'
                : 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.can_strictly_gain_by_hiding ? (
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="text-base font-bold text-white">
                  {result.can_strictly_gain_by_hiding
                    ? `Agent ${result.agent_id} STRICTLY GAINS by Hiding Arguments!`
                    : `Truthful Revelation is an Optimal Response for Agent ${result.agent_id}`}
                </h3>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {result.can_strictly_gain_by_hiding
                    ? `Truthful utility is u_i = ${result.truthful_utility}, but strategically hiding arguments yields maximum utility u_i = ${result.max_utility}.`
                    : `Agent ${result.agent_id} cannot strictly gain by withholding arguments against this opponent profile. Max utility = ${result.max_utility}.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-center">
                <span className="text-slate-400 text-[10px] block">Truthful Utility</span>
                <span className="text-base font-bold text-slate-100">{result.truthful_utility}</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-center">
                <span className="text-slate-400 text-[10px] block">Max Achievable</span>
                <span className="text-base font-bold text-emerald-400">{result.max_utility}</span>
              </div>
            </div>
          </div>

          {/* Strategy Enumeration Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                All 2^{result.owned_arguments.length} Strategy Subsets for Agent {result.agent_id}
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                {result.best_reports.length} Best Response(s) Found
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Strategy Type</th>
                    <th className="py-2.5 px-3">Revealed Subset (A_i&deg;)</th>
                    <th className="py-2.5 px-3">Hidden Arguments</th>
                    <th className="py-2.5 px-3">Grounded Extension Outcome</th>
                    <th className="py-2.5 px-3 text-right">Utility u_i</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {result.all_reports.map((opt, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-800/40 transition ${
                        opt.is_best_report ? 'bg-emerald-950/20' : ''
                      } ${opt.is_truthful ? 'border-l-2 border-indigo-500' : ''}`}
                    >
                      <td className="py-2.5 px-3 font-sans font-semibold">
                        {opt.is_truthful ? (
                          <span className="text-indigo-400 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Truthful (All)
                          </span>
                        ) : opt.report.length === 0 ? (
                          <span className="text-slate-500">Hide All (∅)</span>
                        ) : (
                          <span className="text-slate-400">Partial Hiding</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-200 font-bold">
                        {opt.report.length ? `{ ${opt.report.join(', ')} }` : '∅'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {opt.hidden.length ? `{ ${opt.hidden.join(', ')} }` : 'None'}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400">
                        {opt.grounded_extension.length
                          ? `{ ${opt.grounded_extension.join(', ')} }`
                          : '∅'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-sm font-bold text-white">
                        {opt.utility}
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        {opt.is_best_report ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            <Award className="w-3 h-3" /> Optimal
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">Suboptimal</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
