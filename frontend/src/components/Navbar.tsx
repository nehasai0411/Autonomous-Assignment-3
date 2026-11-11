import React from 'react';
import { Network, RefreshCw, Terminal } from 'lucide-react';
import { useFramework } from '../context/FrameworkContext';

interface NavbarProps {
  activeTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTitle }) => {
  const { framework, activePresetId, presets, refreshAnalysis, isLoading } = useFramework();

  const currentPresetName =
    activePresetId && presets[activePresetId] ? presets[activePresetId].name : 'Custom Framework';

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between select-none">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-semibold text-slate-100">{activeTitle}</h2>
        <span className="text-slate-600">|</span>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Network className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-medium text-slate-300">{currentPresetName}</span>
          <span className="text-slate-500">
            ({framework.arguments.length} args, {framework.attacks.length} attacks)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => refreshAnalysis()}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Re-compute</span>
        </button>

        <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-md">
          <Terminal className="w-3 h-3" />
          <span>Engine v1.0 • Pure Math</span>
        </div>
      </div>
    </header>
  );
};
