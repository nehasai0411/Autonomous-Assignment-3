import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, ElementDefinition } from 'cytoscape';
import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { LegalLabelling } from '../types';

interface GraphViewerProps {
  argumentsList: string[];
  attacks: [string, string][];
  agentOwnership?: Record<string, string[]>;
  labelling?: LegalLabelling;
  groundedExtension?: string[];
  highlightedPath?: string[];
  revealedArguments?: string[];
  onNodeClick?: (argName: string) => void;
  selectedNode?: string | null;
  height?: string;
}

const AGENT_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f97316', // orange
  '#10b981', // emerald
  '#ec4899', // pink
  '#06b6d4', // cyan
];

export const GraphViewer: React.FC<GraphViewerProps> = ({
  argumentsList,
  attacks,
  agentOwnership,
  labelling,
  groundedExtension,
  highlightedPath,
  revealedArguments,
  onNodeClick,
  selectedNode,
  height = '480px',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [layoutName, setLayoutName] = useState<string>('cose');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const getAgentColor = (arg: string): string => {
    if (!agentOwnership) return '#64748b';
    const agents = Object.keys(agentOwnership);
    for (let i = 0; i < agents.length; i++) {
      const owned = agentOwnership[agents[i]] || [];
      if (owned.includes(arg)) {
        return AGENT_COLORS[i % AGENT_COLORS.length];
      }
    }
    return '#64748b';
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const elements: ElementDefinition[] = [];

    // Nodes
    argumentsList.forEach((arg) => {
      const isHidden = revealedArguments && !revealedArguments.includes(arg);
      const isSelected = selectedNode === arg;
      const isGrounded = groundedExtension && groundedExtension.includes(arg);
      const isPathNode = highlightedPath && highlightedPath.includes(arg);

      let labelTag = arg;
      let nodeColor = getAgentColor(arg);

      if (labelling && labelling[arg]) {
        const l = labelling[arg];
        labelTag = `${arg} [${l}]`;
        if (l === 'IN') nodeColor = '#10b981';
        else if (l === 'OUT') nodeColor = '#ef4444';
        else nodeColor = '#f59e0b';
      }

      const classes: string[] = [];
      if (isHidden) classes.push('hidden-node');
      if (isSelected) classes.push('selected-node');
      if (isGrounded) classes.push('grounded-node');
      if (isPathNode) classes.push('path-node');

      elements.push({
        data: {
          id: arg,
          label: labelTag,
          bgColor: nodeColor,
        },
        classes: classes.join(' '),
      });
    });

    // Edges
    attacks.forEach(([u, v], idx) => {
      if (!argumentsList.includes(u) || !argumentsList.includes(v)) return;

      const isPathEdge =
        highlightedPath &&
        highlightedPath.some(
          (node, i) => i < highlightedPath.length - 1 && node === u && highlightedPath[i + 1] === v
        );

      elements.push({
        data: {
          id: `edge_${u}_${v}_${idx}`,
          source: u,
          target: v,
        },
        classes: isPathEdge ? 'path-edge' : '',
      });
    });

    if (!cyRef.current) {
      cyRef.current = cytoscape({
        container: containerRef.current,
        elements,
        style: [
          {
            selector: 'node',
            style: {
              label: 'data(label)',
              'background-color': 'data(bgColor)',
              'border-color': '#334155',
              'border-width': 2,
              'border-style': 'solid',
              opacity: 1,
              color: '#ffffff',
              'text-outline-color': '#0f172a',
              'text-outline-width': 2,
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': 13,
              'font-weight': 'bold',
              width: 44,
              height: 44,
            },
          },
          {
            selector: 'node.hidden-node',
            style: {
              opacity: 0.35,
              'border-style': 'dashed',
            },
          },
          {
            selector: 'node.grounded-node',
            style: {
              'border-color': '#10b981',
              'border-width': 4,
            },
          },
          {
            selector: 'node.selected-node',
            style: {
              'border-color': '#6366f1',
              'border-width': 4,
            },
          },
          {
            selector: 'node.path-node',
            style: {
              'border-color': '#ec4899',
              'border-width': 4,
            },
          },
          {
            selector: 'edge',
            style: {
              width: 2,
              'line-color': '#94a3b8',
              'target-arrow-color': '#94a3b8',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'arrow-scale': 1.3,
            },
          },
          {
            selector: 'edge.path-edge',
            style: {
              width: 4,
              'line-color': '#ec4899',
              'target-arrow-color': '#ec4899',
            },
          },
          {
            selector: 'edge[source = target]',
            style: {
              'curve-style': 'bezier',
              'loop-direction': '-45deg',
              'loop-sweep': '-90deg',
              'control-point-step-size': 50,
            },
          },
        ],
        layout: {
          name: layoutName as any,
          padding: 30,
        },
      });

      cyRef.current.on('tap', 'node', (evt) => {
        const nodeId = evt.target.id();
        if (onNodeClick) onNodeClick(nodeId);
      });
    } else {
      const cy = cyRef.current;
      cy.elements().remove();
      cy.add(elements);
      cy.layout({
        name: layoutName as any,
        animate: true,
        animationDuration: 400,
        padding: 30,
      }).run();
    }
  }, [
    argumentsList,
    attacks,
    agentOwnership,
    labelling,
    groundedExtension,
    highlightedPath,
    revealedArguments,
    selectedNode,
    layoutName,
  ]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(undefined, 30);
  const handleRelayout = () => {
    cyRef.current
      ?.layout({
        name: layoutName as any,
        animate: true,
        animationDuration: 400,
        padding: 30,
      })
      .run();
  };

  return (
    <div
      className={`relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg ${
        isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : ''
      }`}
      style={{ height: isFullscreen ? undefined : height }}
    >
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Toolbar */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-800/90 backdrop-blur border border-slate-700/80 rounded-lg p-1.5 shadow-md">
        <select
          value={layoutName}
          onChange={(e) => setLayoutName(e.target.value)}
          className="text-xs bg-slate-900 text-slate-200 border border-slate-700 rounded px-2 py-1 outline-none"
        >
          <option value="cose">Force-Directed (Cose)</option>
          <option value="circle">Circle</option>
          <option value="breadthfirst">Hierarchical</option>
          <option value="concentric">Concentric</option>
          <option value="grid">Grid</option>
        </select>

        <button
          onClick={handleRelayout}
          title="Relayout"
          className="p-1 hover:bg-slate-700 text-slate-300 rounded transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1 hover:bg-slate-700 text-slate-300 rounded transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1 hover:bg-slate-700 text-slate-300 rounded transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFit}
          title="Fit View"
          className="px-2 py-0.5 text-xs bg-slate-700 text-slate-200 hover:bg-slate-600 rounded transition"
        >
          Fit
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          className="p-1 hover:bg-slate-700 text-slate-300 rounded transition"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Graph Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 flex items-center gap-4 shadow-md pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          <span>Nodes (Args)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-slate-400 inline-block" />
          <span>Attacks (u &rarr; v)</span>
        </div>
        {highlightedPath && highlightedPath.length > 0 && (
          <div className="flex items-center gap-1.5 text-pink-400 font-semibold">
            <span className="w-3 h-3 rounded-full bg-pink-500 inline-block animate-pulse" />
            <span>Odd Path Active</span>
          </div>
        )}
      </div>
    </div>
  );
};
