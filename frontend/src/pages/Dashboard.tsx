import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Database,
  Layers,
  Network,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { GraphViewer } from '../components/GraphViewer';
import { useFramework } from '../context/FrameworkContext';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { framework, agentOwnership, analysis, loadPreset, activePresetId, presets } =
    useFramework();

  const activePreset = activePresetId ? presets[activePresetId] : null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3 h-3" />
            Academic Assignment 3 • Computational Argumentation
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Argumentation Framework Engine & Strategic Mechanism
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Full-stack implementation of Dung's Abstract Argumentation Framework semantics (Part A)
            and Multi-Agent Strategic Revelation under Grounded Direct Mechanisms (Part B), including
            Theorem 5.3 strategyproofness verification and Theorem 5.4 odd-length path sufficiency.
          </p>
        </div>

        {/* Quick Example Switches */}
        <div className="mt-5 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400">Quick Switch Presets:</span>
          <button
            onClick={() => loadPreset('example_5_10')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
              activePresetId === 'example_5_10'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span>Example 5.10 (Manipulable)</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </button>

          <button
            onClick={() => loadPreset('example_5_11')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
              activePresetId === 'example_5_11'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span>Example 5.11 (Strategyproof)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          <button
            onClick={() => onNavigate('experiments')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
          >
            <span>3,000 Random Experiments</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Book Misprint Note Alert (if current preset is 5.10 or 5.11) */}
      {activePreset?.misprint_notes && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-4 text-xs text-amber-200/90 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-300 mb-0.5">
              Prescribed Textbook Misprint Addressed:
            </div>
            <div>{activePreset.misprint_notes}</div>
          </div>
        </div>
      )}

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Arguments
          </div>
          <div className="text-2xl font-bold text-white mt-1">{framework.arguments.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Vertices in AF</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Attacks
          </div>
          <div className="text-2xl font-bold text-white mt-1">{framework.attacks.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Directed Relations</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Grounded Ext.
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {analysis?.extensions.grounded[0]?.length ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Unique Least Fixed Pt</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Complete Exts
          </div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">
            {analysis?.counts.complete ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Admissible Fixed Pts</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Preferred Exts
          </div>
          <div className="text-2xl font-bold text-blue-400 mt-1">
            {analysis?.counts.preferred ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Maximal Admissible</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Stable Exts
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-1">
            {analysis?.counts.stable ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Total Attacking Sets</div>
        </div>
      </div>

      {/* Main Grid: Interactive Graph + Extension Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Graph (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Network className="w-4 h-4 text-indigo-400" />
              Argumentation Graph Visualization
            </h3>
            <span className="text-xs text-slate-400">
              Nodes colored by Agent • Green border = in Grounded Extension
            </span>
          </div>

          <GraphViewer
            argumentsList={framework.arguments}
            attacks={framework.attacks}
            agentOwnership={agentOwnership}
            groundedExtension={analysis?.extensions.grounded[0]}
            height="460px"
          />
        </div>

        {/* Right: Semantics & Quick Links (1 col) */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Extensions Overview
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block mb-1">
                  Grounded Extension (GE):
                </span>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-emerald-400">
                  {analysis?.extensions.grounded[0]?.length
                    ? `{ ${analysis.extensions.grounded[0].join(', ')} }`
                    : '∅ (Empty Set)'}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">
                  Preferred Extensions ({analysis?.counts.preferred ?? 0}):
                </span>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-blue-400 space-y-1">
                  {analysis?.extensions.preferred.map((ext, idx) => (
                    <div key={idx}>
                      {ext.length ? `{ ${ext.join(', ')} }` : '∅'}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">
                  Stable Extensions ({analysis?.counts.stable ?? 0}):
                </span>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-purple-400 space-y-1">
                  {analysis?.extensions.stable.length ? (
                    analysis.extensions.stable.map((ext, idx) => (
                      <div key={idx}>
                        {ext.length ? `{ ${ext.join(', ')} }` : '∅'}
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">None exist</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('extensions')}
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <span>Explore Detailed Extension Checks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Strategic Argumentation Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Strategic Mechanics
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyze multi-agent payoffs, best-response reporting, and verify Theorem 5.3 & 5.4.
            </p>
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => onNavigate('strategic')}
                className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition text-center"
              >
                Mechanism
              </button>
              <button
                onClick={() => onNavigate('strategyproofness')}
                className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition text-center"
              >
                Theorems 5.3/5.4
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
