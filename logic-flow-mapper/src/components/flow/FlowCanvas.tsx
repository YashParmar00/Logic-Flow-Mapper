import { useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
  useViewport,
} from '@xyflow/react';
import type { Connection, Node, Edge, OnSelectionChangeParams } from '@xyflow/react';
import toast from 'react-hot-toast';

import { useFlowStore } from '../../store';
import { useKeyboardShortcuts } from '../../hooks';
import { CustomNode } from '../nodes/CustomNode';
import { EmptyState } from './EmptyState';
import { canConnect } from '../../utils/edgeHelpers';
import { getToastMessage } from '../../utils/toastMessages';

import '@xyflow/react/dist/style.css';

// Stable references to prevent React Flow warnings
const NODE_TYPES = { custom: CustomNode } as const;
const DEFAULT_EDGE_OPTIONS = { type: 'smoothstep' as const };
const SNAP_GRID: [number, number] = [15, 15];
const CONNECTION_LINE_STYLE = { stroke: '#94a3b8', strokeWidth: 2 };

// More zoomed out initial view
const FIT_VIEW_OPTIONS = { padding: 0.5, maxZoom: 0.8 };

const EDGE_COLORS = {
  default: '#94a3b8',
  cycle: '#ef4444',
  highlighted: '#10b981',
};

function getEdgeColor(isInCycle: boolean, isHighlighted: boolean): string {
  if (isInCycle) return EDGE_COLORS.cycle;
  if (isHighlighted) return EDGE_COLORS.highlighted;
  return EDGE_COLORS.default;
}

// Zoom slider control
function ZoomSlider() {
  const { zoom, x, y } = useViewport();
  const { setViewport, fitView, zoomIn, zoomOut } = useReactFlow();

  const handleChange = (value: number) => {
    setViewport({ x, y, zoom: value });
  };

  return (
    <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 shadow-sm">
        <button
          onClick={() => zoomOut()}
          className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-md text-slate-500 text-base hover:bg-slate-100"
          title="Zoom out"
        >
          −
        </button>
        <input
          type="range"
          min={0.2}
          max={2}
          step={0.01}
          value={zoom}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="w-28 accent-blue-500"
        />
        <span className="text-[11px] text-slate-500 w-10 text-right">{zoom.toFixed(2)}x</span>
        <button
          onClick={() => zoomIn()}
          className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-md text-slate-500 text-base hover:bg-slate-100"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => fitView({ padding: 0.3 })}
          className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-md text-slate-500 text-base hover:bg-slate-100"
          title="Fit view"
        >
          ⤢
        </button>
      </div>
    </div>
  );
}

export function FlowCanvas() {
  useKeyboardShortcuts();

  const lastToastRef = useRef<{ reason: string; time: number } | null>(null);
  const lastEdgeHintRef = useRef<string | null>(null);

  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const cycleNodes = useFlowStore((s) => s.cycleNodes);
  const cycleEdges = useFlowStore((s) => s.cycleEdges);
  const highlightedNodes = useFlowStore((s) => s.highlightedNodes);
  const highlightedEdges = useFlowStore((s) => s.highlightedEdges);
  const onNodesChange = useFlowStore((s) => s.onNodesChange);
  const onEdgesChange = useFlowStore((s) => s.onEdgesChange);
  const onConnect = useFlowStore((s) => s.onConnect);
  const onEdgesDelete = useFlowStore((s) => s.onEdgesDelete);
  const setSelectedNode = useFlowStore((s) => s.setSelectedNode);

  // Validate connection before allowing it
  const isValidConnection = useCallback(
    (connection: Edge | Connection): boolean => {
      const { source, target } = connection;
      if (!source || !target) return false;
      return canConnect(source, target, nodes, edges).isValid;
    },
    [nodes, edges]
  );

  const handleConnectStart = useCallback(() => {
    lastToastRef.current = null;
  }, []);

  // Show toast on invalid connection attempt
  const handleConnectEnd = useCallback(
    (_event: MouseEvent | TouchEvent, connectionState: unknown) => {
      const state = connectionState as {
        isValid?: boolean;
        fromNode?: { id: string };
        toNode?: { id: string };
        fromHandle?: { nodeId: string };
        toHandle?: { nodeId: string };
      };

      const sourceId = state.fromNode?.id || state.fromHandle?.nodeId;
      const targetId = state.toNode?.id || state.toHandle?.nodeId;

      if (!sourceId || !targetId || state.isValid !== false) return;

      const validation = canConnect(sourceId, targetId, nodes, edges);
      if (!validation.isValid && validation.reason) {
        const now = Date.now();
        const last = lastToastRef.current;

        // Debounce repeated toasts
        if (!last || last.reason !== validation.reason || now - last.time > 2000) {
          toast.error(getToastMessage(validation.reason).title, { duration: 2000 });
          lastToastRef.current = { reason: validation.reason, time: now };
        }
      }
    },
    [nodes, edges]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => setSelectedNode(node.id),
    [setSelectedNode]
  );

  const handlePaneClick = useCallback(
    () => setSelectedNode(null),
    [setSelectedNode]
  );

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: OnSelectionChangeParams) => {
      if (selectedNodes.length === 1) {
        setSelectedNode(selectedNodes[0].id);
      } else if (selectedNodes.length === 0 && selectedEdges.length === 0) {
        setSelectedNode(null);
      } else if (selectedEdges.length > 0) {
        setSelectedNode(null);
        const key = selectedEdges.map((e) => e.id).sort().join(',');
        if (key !== lastEdgeHintRef.current) {
          lastEdgeHintRef.current = key;
          toast('Press Delete/Backspace to remove this edge', {
            id: 'edge-delete-hint',
            duration: 1800,
            icon: '✂️',
          });
        }
      }
    },
    [setSelectedNode]
  );

  // Apply cycle/highlight styling to nodes
  const styledNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isInCycle: cycleNodes.has(node.id),
          isHighlighted: highlightedNodes.has(node.id),
        },
      })),
    [nodes, cycleNodes, highlightedNodes]
  );

  // Apply cycle/highlight styling to edges
  const styledEdges = useMemo(
    () =>
      edges.map((edge) => {
        const isInCycle = cycleEdges.has(edge.id);
        const isHighlighted = highlightedEdges.has(edge.id);
        const isSelected = edge.selected === true;
        const baseColor = getEdgeColor(isInCycle, isHighlighted);
        const color = isSelected ? '#3b82f6' : baseColor;

        return {
          ...edge,
          type: 'smoothstep' as const,
          animated: isInCycle || isHighlighted,
          style: {
            stroke: color,
            strokeWidth: isSelected ? 3.5 : isHighlighted ? 3 : 2,
            filter: isSelected ? 'drop-shadow(0 0 6px rgba(59,130,246,0.55))' : undefined,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color,
          },
        };
      }),
    [edges, cycleEdges, highlightedEdges]
  );

  const getMinimapNodeColor = useCallback(
    (node: Node) => {
      if (cycleNodes.has(node.id)) return '#ef4444';
      if (highlightedNodes.has(node.id)) return '#10b981';
      return '#64748b';
    },
    [cycleNodes, highlightedNodes]
  );

  return (
    <div className="flex-1 relative">
      {nodes.length === 0 && <EmptyState />}

      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgesDelete={onEdgesDelete}
        onConnectStart={handleConnectStart}
        onConnectEnd={handleConnectEnd}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onSelectionChange={handleSelectionChange}
        isValidConnection={isValidConnection}
        nodeTypes={NODE_TYPES}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        fitView
        fitViewOptions={FIT_VIEW_OPTIONS}
        snapToGrid
        snapGrid={SNAP_GRID}
        connectionLineStyle={CONNECTION_LINE_STYLE}
        deleteKeyCode={['Delete', 'Backspace']}
        minZoom={0.2}
        maxZoom={2}
        className="bg-slate-50"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#cbd5e1"
        />
        <ZoomSlider />
        <MiniMap
          nodeColor={getMinimapNodeColor}
          maskColor="rgba(0, 0, 0, 0.08)"
          className="bg-white! border! border-slate-200! rounded-lg!"
        />
      </ReactFlow>

    </div>
  );
}
