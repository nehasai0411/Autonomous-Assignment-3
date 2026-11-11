import React, { useState } from 'react';
import {
  Download,
  Plus,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { GraphViewer } from '../components/GraphViewer';
import { useFramework } from '../context/FrameworkContext';

export const FrameworkBuilder: React.FC = () => {
  const {
    framework,
    agentOwnership,
    addArgument,
    removeArgument,
    addAttack,
    removeAttack,
    assignArgumentToAgent,
    createAgent,
    deleteAgent,
    setFramework,
    setAgentOwnership,
  } = useFramework();

  const [newArgName, setNewArgName] = useState<string>('');
  const [selectedAgentForNewArg, setSelectedAgentForNewArg] = useState<string>('');
  const [attacker, setAttacker] = useState<string>('');
  const [target, setTarget] = useState<string>('');
  const [newAgentId, setNewAgentId] = useState<string>('');
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const agentIds = Object.keys(agentOwnership);

  const handleAddArg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArgName.trim()) return;
    addArgument(newArgName.trim(), selectedAgentForNewArg || undefined);
    setNewArgName('');
  };

  const handleAddAttack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attacker || !target) return;
    addAttack(attacker, target);
    setAttacker('');
    setTarget('');
  };

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentId.trim()) return;
    createAgent(newAgentId.trim());
    setNewAgentId('');
  };

  const handleExportJson = () => {
    const data = {
      framework,
      agent_ownership: agentOwnership,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'argumentation_framework.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    setJsonError(null);
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.framework || !Array.isArray(parsed.framework.arguments)) {
        throw new Error("Invalid format. Expected JSON with 'framework.arguments' array.");
      }
      setFramework(parsed.framework);
      if (parsed.agent_ownership) {
        setAgentOwnership(parsed.agent_ownership);
      }
      setJsonInput('');
    } catch (err: any) {
      setJsonError(err.message || 'JSON parsing failed');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Framework Builder</h1>
          <p className="text-xs text-slate-400">
            Construct, modify, and assign arguments and directed attacks in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cytoscape Graph Canvas (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <GraphViewer
            argumentsList={framework.arguments}
            attacks={framework.attacks}
            agentOwnership={agentOwnership}
            height="500px"
          />

          {/* Attacks List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Active Directed Attacks ({framework.attacks.length})
            </h3>
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
              {framework.attacks.map(([u, v], i) => (
                <div
                  key={`${u}-${v}-${i}`}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-300 font-mono"
                >
                  <span className="text-indigo-400 font-bold">{u}</span>
                  <span className="text-slate-500">&rarr;</span>
                  <span className="text-rose-400 font-bold">{v}</span>
                  <button
                    onClick={() => removeAttack(u, v)}
                    title="Remove attack"
                    className="ml-1 text-slate-500 hover:text-rose-400 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {framework.attacks.length === 0 && (
                <span className="text-xs text-slate-500 italic">No attacks defined.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Controls & Forms (1 col) */}
        <div className="space-y-4">
          {/* Add Argument Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              Add Argument
            </h3>
            <form onSubmit={handleAddArg} className="space-y-2.5">
              <input
                type="text"
                placeholder="Argument name (e.g. a7)"
                value={newArgName}
                onChange={(e) => setNewArgName(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-indigo-500"
              />
              <select
                value={selectedAgentForNewArg}
                onChange={(e) => setSelectedAgentForNewArg(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-indigo-500"
              >
                <option value="">Assign to Agent (Optional)...</option>
                {agentIds.map((aid) => (
                  <option key={aid} value={aid}>
                    {aid}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
              >
                Add Argument
              </button>
            </form>
          </div>

          {/* Add Attack Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-rose-400" />
              Add Directed Attack
            </h3>
            <form onSubmit={handleAddAttack} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Attacker (u)</label>
                  <select
                    value={attacker}
                    onChange={(e) => setAttacker(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="">Select...</option>
                    {framework.arguments.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Target (v)</label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 outline-none focus:border-indigo-500"
                  >
                    <option value="">Select...</option>
                    {framework.arguments.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={!attacker || !target}
                className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
              >
                Add Attack ({attacker || 'u'} &rarr; {target || 'v'})
              </button>
            </form>
          </div>

          {/* Argument Ownership Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Argument Ownership
              </span>
              <span className="text-[10px] text-slate-400">{framework.arguments.length} args</span>
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {framework.arguments.map((arg) => {
                const currentAgent =
                  Object.entries(agentOwnership).find(([_, args]) => args.includes(arg))?.[0] || '';

                return (
                  <div
                    key={arg}
                    className="flex items-center justify-between bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs"
                  >
                    <span className="font-mono font-bold text-slate-200">{arg}</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={currentAgent}
                        onChange={(e) => assignArgumentToAgent(arg, e.target.value)}
                        className="text-[11px] bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                      >
                        <option value="" disabled>
                          Select Agent
                        </option>
                        {agentIds.map((aid) => (
                          <option key={aid} value={aid}>
                            {aid}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeArgument(arg)}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Create New Agent */}
            <form onSubmit={handleAddAgent} className="pt-2 flex gap-2">
              <input
                type="text"
                placeholder="New agent ID"
                value={newAgentId}
                onChange={(e) => setNewAgentId(e.target.value)}
                className="flex-1 text-xs bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 outline-none"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition"
              >
                + Agent
              </button>
            </form>
          </div>

          {/* Import JSON */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              Import Framework JSON
            </h3>
            <textarea
              placeholder='Paste JSON with {"framework": {...}, "agent_ownership": {...}}'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-20 text-[11px] font-mono bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 outline-none resize-none"
            />
            {jsonError && <p className="text-[11px] text-rose-400">{jsonError}</p>}
            <button
              onClick={handleImportJson}
              disabled={!jsonInput.trim()}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition disabled:opacity-50"
            >
              Load from JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
