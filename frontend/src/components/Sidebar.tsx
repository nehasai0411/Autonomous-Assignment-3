import React from 'react';
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Database,
  GitBranch,
  Layers,
  LayoutDashboard,
  Network,
  ShieldAlert,
  Tag,
  Users,
} from 'lucide-react';
import { useFramework } from '../context/FrameworkContext';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  const { framework, presets, activePresetId, loadPreset, agentOwnership } = useFramework();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Overview' },
    { id: 'builder', label: 'Framework Builder', icon: Network, category: 'Framework (Part A)' },
    { id: 'extensions', label: 'Extension Analysis', icon: Layers, category: 'Framework (Part A)' },
    { id: 'labellings', label: 'Legal Labellings', icon: Tag, category: 'Framework (Part A)' },
    { id: 'acceptance', label: 'Acceptance Status', icon: CheckCircle2, category: 'Framework (Part A)' },
    { id: 'strategic', label: 'Strategic Mechanism', icon: Users, category: 'Strategic (Part B)' },
    { id: 'best-reports', label: 'Best Reports', icon: GitBranch, category: 'Strategic (Part B)' },
    { id: 'strategyproofness', label: 'Strategyproofness', icon: ShieldAlert, category: 'Strategic (Part B)' },
    { id: 'experiments', label: 'Random Experiments', icon: BarChart3, category: 'Empirical Study' },
    { id: 'docs', label: 'Documentation & Theory', icon: BookOpen, category: 'Reference' },
  ];

  // Group by category
  const categories = Array.from(new Set(navItems.map((item) => item.category)));

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen select-none">
      {/* Brand & Logo */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 tracking-tight leading-tight">
              ArgEngine & MAS
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Assignment 3 Engine</p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="mt-3">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Active Framework Preset
          </label>
          <select
            value={activePresetId || ''}
            onChange={(e) => {
              if (e.target.value) loadPreset(e.target.value);
            }}
            className="w-full text-xs bg-slate-900 border border-slate-700/80 rounded-md px-2.5 py-1.5 text-slate-200 outline-none focus:border-indigo-500 transition"
          >
            <option value="" disabled>
              Select preset...
            </option>
            {Object.values(presets).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {categories.map((cat) => (
          <div key={cat} className="space-y-1">
            <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {cat}
            </div>
            {navItems
              .filter((item) => item.category === cat)
              .map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                  </button>
                );
              })}
          </div>
        ))}
      </div>

      {/* Footer Info Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/40">
        <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2.5 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Arguments:</span>
            <span className="font-semibold text-slate-200">{framework.arguments.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Attacks:</span>
            <span className="font-semibold text-slate-200">{framework.attacks.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Agents:</span>
            <span className="font-semibold text-indigo-400">
              {Object.keys(agentOwnership).length}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
