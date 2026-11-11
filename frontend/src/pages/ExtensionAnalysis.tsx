import React, { useState } from 'react';
import {
  CheckCircle,
  HelpCircle,
  Layers,
  Play,
  RotateCcw,
  Shield,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useFramework } from '../context/FrameworkContext';
import { api } from '../services/api';
import { SetCheckResponse, DefenceCheckResponse } from '../types';

export const ExtensionAnalysis: React.FC = () => {
  const { framework, analysis } = useFramework();

  // Custom set checking state
  const [selectedSet, setSelectedSet] = useState<string[]>([]);
  const [setCheckResult, setSetCheckResult] = useState<SetCheckResponse | null>(null);
  const [isCheckingSet, setIsCheckingSet] = useState<boolean>(false);

  // Defence check state
  const [targetArgument, setTargetArgument] = useState<string>(framework.arguments[0] || '');
  const [defenceResult, setDefenceResult] = useState<DefenceCheckResponse | null>(null);

  const toggleArgInSet = (arg: string) => {
    setSelectedSet((prev) =>
      prev.includes(arg) ? prev.filter((a) => a !== arg) : [...prev, arg]
    );
  };

  const handleRunSetCheck = async () => {
    setIsCheckingSet(true);
    try {
      const res = await api.checkSet(framework, selectedSet);
      setSetCheckResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingSet(false);
    }
  };

  const handleRunDefenceCheck = async () => {
    if (!targetArgument) return;
    try {
      const res = await api.checkDefence(framework, selectedSet, targetArgument);
      setDefenceResult(res);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Extension Analysis</h1>
        <p className="text-xs text-slate-400">
          Verify Dung's core argumentation semantics, characteristic function, and compute all
          extension classes.
        </p>
      </div>

      {/* Part 1: Interactive Set Tester (Requirements 2, 3, 4, 5) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Custom Set Evaluator: S &sube; A
            </h2>
            <p className="text-xs text-slate-400">
              Select any subset of arguments to test Conflict-Free, Admissibility, Complete Extension,
              and F(S).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedSet([])}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
            >
              Clear (∅)
            </button>
            <button
              onClick={() => setSelectedSet([...framework.arguments])}
              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
            >
              Select All (A)
            </button>
            <button
              onClick={handleRunSetCheck}
              disabled={isCheckingSet}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition flex items-center gap-1.5 shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Evaluate Set</span>
            </button>
          </div>
        </div>

        {/* Argument Toggle Pills */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Choose Arguments in S:
          </label>
          <div className="flex flex-wrap gap-2">
            {framework.arguments.map((arg) => {
              const isSelected = selectedSet.includes(arg);
              return (
                <button
                  key={arg}
                  onClick={() => toggleArgInSet(arg)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition border ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {arg} {isSelected && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Set Evaluation Results Cards */}
        {setCheckResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
            {/* Conflict-free */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                1. Conflict-Free
              </div>
              <div className="flex items-center gap-2">
                {setCheckResult.is_conflict_free ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <span className="text-sm font-bold text-slate-100">
                  {setCheckResult.is_conflict_free ? 'Conflict-Free' : 'Conflicted'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {setCheckResult.is_conflict_free
                  ? 'No attacks exist between arguments in S.'
                  : 'An argument in S attacks another argument in S.'}
              </p>
            </div>

            {/* Admissible */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                2. Admissibility
              </div>
              <div className="flex items-center gap-2">
                {setCheckResult.is_admissible ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <span className="text-sm font-bold text-slate-100">
                  {setCheckResult.is_admissible ? 'Admissible' : 'Not Admissible'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {setCheckResult.is_admissible
                  ? 'Conflict-free and S defends all its arguments (S ⊆ F(S)).'
                  : 'Fails conflict-free or fails to defend all members.'}
              </p>
            </div>

            {/* Complete Extension */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                3. Complete Extension
              </div>
              <div className="flex items-center gap-2">
                {setCheckResult.is_complete_extension ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-sm font-bold text-slate-100">
                  {setCheckResult.is_complete_extension ? 'Complete Extension' : 'Not Complete'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {setCheckResult.is_complete_extension
                  ? 'Fixed point of F(S): S defends all members and contains all it defends (F(S) = S).'
                  : 'S is either not admissible or F(S) ≠ S.'}
              </p>
            </div>

            {/* Characteristic Function F(S) */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                4. Characteristic F(S)
              </div>
              <div className="font-mono text-xs font-bold text-indigo-400 py-1">
                F(S) ={' '}
                {setCheckResult.characteristic_function.length
                  ? `{ ${setCheckResult.characteristic_function.join(', ')} }`
                  : '∅'}
              </div>
              <p className="text-[11px] text-slate-400">
                Range S⁺ = {setCheckResult.range_plus.join(', ') || '∅'}
              </p>
            </div>
          </div>
        )}

        {/* Defence Checker against target argument */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-semibold">Test if S defends argument:</span>
            <select
              value={targetArgument}
              onChange={(e) => setTargetArgument(e.target.value)}
              className="text-xs bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 outline-none"
            >
              {framework.arguments.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <button
              onClick={handleRunDefenceCheck}
              className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition"
            >
              Test Defence
            </button>
          </div>

          {defenceResult && (
            <div className="flex items-center gap-2 text-xs">
              {defenceResult.is_defended ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> S defends {defenceResult.argument}
                </span>
              ) : (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> S DOES NOT defend {defenceResult.argument}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Part 2: Grounded Extension Iteration Log (Requirement 6.A) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            Grounded Extension Fixed-Point Iteration (6.A)
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Final GE:{' '}
            {analysis?.extensions.grounded[0]?.length
              ? `{ ${analysis.extensions.grounded[0].join(', ')} }`
              : '∅'}
          </span>
        </div>

        <p className="text-xs text-slate-400">
          The grounded extension is computed by applying the characteristic function F
          iteratively from S₀ = ∅ until reaching the least fixed point Sₖ₊₁ = Sₖ.
        </p>

        <div className="space-y-2">
          {analysis?.grounded_iteration_log.map((step) => (
            <div
              key={step.step}
              className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs"
            >
              <div className="w-16 font-mono font-bold text-slate-400">Step {step.step}:</div>
              <div className="flex-1 font-mono text-slate-200">
                S_{step.step} = {step.set.length ? `{ ${step.set.join(', ')} }` : '∅'}
              </div>
              {step.new_added.length > 0 ? (
                <div className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  + Added: {step.new_added.join(', ')}
                </div>
              ) : (
                <div className="text-[11px] font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded">
                  Fixed Point Reached
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Part 3: All Extension Types (Requirements 6.B, 6.C) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Complete Extensions (6.B) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">
              Complete Extensions ({analysis?.counts.complete ?? 0})
            </h3>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Requirement 6.B</span>
          </div>
          <p className="text-xs text-slate-400">
            Admissible sets that contain every argument they defend (F(S) = S).
          </p>
          <div className="space-y-1.5 font-mono text-xs">
            {analysis?.extensions.complete.map((ext, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 p-2 rounded text-indigo-300"
              >
                E_{idx + 1} = {ext.length ? `{ ${ext.join(', ')} }` : '∅'}
              </div>
            ))}
          </div>
        </div>

        {/* Preferred Extensions (6.C) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">
              Preferred Extensions ({analysis?.counts.preferred ?? 0})
            </h3>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Requirement 6.C</span>
          </div>
          <p className="text-xs text-slate-400">
            Maximal (w.r.t. set inclusion) admissible sets. Always non-empty in finite AFs.
          </p>
          <div className="space-y-1.5 font-mono text-xs">
            {analysis?.extensions.preferred.map((ext, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 p-2 rounded text-blue-300"
              >
                P_{idx + 1} = {ext.length ? `{ ${ext.join(', ')} }` : '∅'}
              </div>
            ))}
          </div>
        </div>

        {/* Stable Extensions (6.C) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">
              Stable Extensions ({analysis?.counts.stable ?? 0})
            </h3>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Requirement 6.C</span>
          </div>
          <p className="text-xs text-slate-400">
            Conflict-free sets attacking every argument outside them (S ∪ R(S) = A). May not exist.
          </p>
          <div className="space-y-1.5 font-mono text-xs">
            {analysis?.extensions.stable.length ? (
              analysis.extensions.stable.map((ext, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 p-2 rounded text-purple-300"
                >
                  S_{idx + 1} = {ext.length ? `{ ${ext.join(', ')} }` : '∅'}
                </div>
              ))
            ) : (
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded text-slate-500 italic">
                No stable extensions exist for this framework (e.g. odd cycle present).
              </div>
            )}
          </div>
        </div>

        {/* Semi-Stable Extensions (6.C) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">
              Semi-Stable Extensions ({analysis?.counts.semi_stable ?? 0})
            </h3>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Requirement 6.C</span>
          </div>
          <p className="text-xs text-slate-400">
            Complete extensions with inclusion-maximal range S⁺ = S ∪ R(S). Always exist.
          </p>
          <div className="space-y-1.5 font-mono text-xs">
            {analysis?.extensions.semi_stable.map((ext, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 p-2 rounded text-emerald-300"
              >
                SS_{idx + 1} = {ext.length ? `{ ${ext.join(', ')} }` : '∅'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
