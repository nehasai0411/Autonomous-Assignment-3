import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Layers,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useFramework } from '../context/FrameworkContext';
import { api } from '../services/api';
import { AcceptanceResponse } from '../types';

export const AcceptanceStatusPage: React.FC = () => {
  const { framework } = useFramework();

  const [selectedArg, setSelectedArg] = useState<string>(framework.arguments[0] || '');
  const [selectedSemantics, setSelectedSemantics] = useState<string>('preferred');
  const [result, setResult] = useState<AcceptanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (framework.arguments.length > 0 && !framework.arguments.includes(selectedArg)) {
      setSelectedArg(framework.arguments[0]);
    }
  }, [framework.arguments]);

  const evaluateAcceptance = async (arg: string, sem: string) => {
    if (!arg) return;
    setIsLoading(true);
    try {
      const res = await api.checkAcceptance(framework, arg, sem);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedArg) {
      evaluateAcceptance(selectedArg, selectedSemantics);
    }
  }, [selectedArg, selectedSemantics, framework]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Acceptance Status</h1>
        <p className="text-xs text-slate-400">
          Requirement 6.E: Determine whether an argument is Skeptically Accepted, Credulously Accepted,
          or Rejected under any selectable Dung semantics.
        </p>
      </div>

      {/* Selectors Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Select Argument (&alpha;):
            </label>
            <div className="flex flex-wrap gap-2">
              {framework.arguments.map((arg) => (
                <button
                  key={arg}
                  onClick={() => setSelectedArg(arg)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition border ${
                    selectedArg === arg
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {arg}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Select Semantics (&sigma;):
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'grounded', label: 'Grounded' },
                { id: 'complete', label: 'Complete' },
                { id: 'preferred', label: 'Preferred' },
                { id: 'stable', label: 'Stable' },
                { id: 'semi_stable', label: 'Semi-Stable' },
              ].map((sem) => (
                <button
                  key={sem.id}
                  onClick={() => setSelectedSemantics(sem.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                    selectedSemantics === sem.id
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sem.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Evaluation for:
              </span>
              <span className="text-lg font-mono font-bold text-white px-3 py-0.5 rounded bg-slate-950 border border-slate-800">
                {result.argument}
              </span>
              <span className="text-xs text-slate-500">under</span>
              <span className="text-sm font-semibold text-indigo-400 capitalize">
                {result.semantics.replace('_', '-')} Semantics
              </span>
            </div>

            {/* Status Pill */}
            <div>
              {result.status === 'skeptically_accepted' && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-950 border border-emerald-700 text-emerald-300 shadow-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Skeptically Accepted (In All Extensions)</span>
                </div>
              )}
              {result.status === 'credulously_accepted' && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-950 border border-blue-700 text-blue-300 shadow-sm">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Credulously Accepted (In Some Extensions)</span>
                </div>
              )}
              {result.status === 'rejected' && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-950 border border-rose-700 text-rose-300 shadow-sm">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Rejected (In No Extensions)</span>
                </div>
              )}
            </div>
          </div>

          {/* Explanation & Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase">
                Extension Membership
              </div>
              <div className="text-xl font-bold text-slate-100">
                {result.in_count} of {result.extension_count}
              </div>
              <p className="text-[11px] text-slate-400">{result.explanation}</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase">
                Skeptical Criteria (&forall; E &in; &Epsilon;)
              </div>
              <div className="flex items-center gap-2">
                {result.in_all ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-500" />
                )}
                <span className="text-sm font-bold text-slate-200">
                  {result.in_all ? 'Satisfied' : 'Not Satisfied'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Must be present in every single extension of this semantics.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase">
                Credulous Criteria (&exist; E &in; &Epsilon;)
              </div>
              <div className="flex items-center gap-2">
                {result.in_any ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-500" />
                )}
                <span className="text-sm font-bold text-slate-200">
                  {result.in_any ? 'Satisfied' : 'Not Satisfied'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Must be present in at least one extension of this semantics.
              </p>
            </div>
          </div>

          {/* List of Extensions */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Extensions under {result.semantics} ({result.extensions.length}):
            </h4>
            <div className="space-y-1.5 font-mono text-xs">
              {result.extensions.map((ext, idx) => {
                const containsTarget = ext.includes(result.argument);
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-lg border ${
                      containsTarget
                        ? 'bg-slate-950 border-emerald-800/80 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>
                      E_{idx + 1} = {ext.length ? `{ ${ext.join(', ')} }` : '∅'}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        containsTarget
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      {containsTarget ? 'Contains ' + result.argument : 'Does Not Contain'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
