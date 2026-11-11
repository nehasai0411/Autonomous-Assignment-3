import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import { GraphViewer } from '../components/GraphViewer';
import { useFramework } from '../context/FrameworkContext';

export const LabellingsPage: React.FC = () => {
  const { framework, analysis, agentOwnership } = useFramework();
  const [selectedLabellingIdx, setSelectedLabellingIdx] = useState<number>(0);

  const labellings = analysis?.legal_labellings || [];
  const activeLabelling = labellings[selectedLabellingIdx] || labellings[0] || {};

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Legal Labellings (Caminada)</h1>
        <p className="text-xs text-slate-400">
          Requirement 6.D: Display all legal IN / OUT / UNDEC argument labellings and visualize on the graph.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Graph with Labelling Colors (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">
              Labelling Visualization: L_{selectedLabellingIdx + 1}
            </h3>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> IN (Accepted)
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> OUT (Defeated)
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> UNDEC (Undecided)
              </span>
            </div>
          </div>

          <GraphViewer
            argumentsList={framework.arguments}
            attacks={framework.attacks}
            agentOwnership={agentOwnership}
            labelling={activeLabelling}
            height="460px"
          />

          {/* Theory Note */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-slate-200">Caminada's Labelling Legitimacy Conditions:</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
              <li>
                <strong className="text-emerald-400">IN:</strong> An argument is IN iff all its attackers are OUT (or it has no attackers).
              </li>
              <li>
                <strong className="text-rose-400">OUT:</strong> An argument is OUT iff at least one of its attackers is IN.
              </li>
              <li>
                <strong className="text-amber-400">UNDEC:</strong> An argument is UNDEC iff it is neither IN nor OUT (has no IN attacker, but not all attackers are OUT).
              </li>
            </ul>
          </div>
        </div>

        {/* Right: Labellings List (1 col) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              All Legal Labellings ({labellings.length})
            </span>
          </h3>

          <div className="space-y-2 max-h-[520px] overflow-y-auto">
            {labellings.map((lab, idx) => {
              const isSelected = selectedLabellingIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedLabellingIdx(idx)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      Labelling L_{idx + 1}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-950/70 border border-indigo-800/80 px-2 py-0.5 rounded">
                        Active on Graph
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                    {Object.entries(lab).map(([arg, status]) => (
                      <div
                        key={arg}
                        className={`px-2 py-1 rounded text-center font-bold text-[11px] ${
                          status === 'IN'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                            : status === 'OUT'
                            ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                            : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                        }`}
                      >
                        {arg}: {status}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
