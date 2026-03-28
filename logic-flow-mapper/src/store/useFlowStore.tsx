import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import type { Connection, NodeChange, EdgeChange } from '@xyflow/react';
import toast from 'react-hot-toast';

import { detectCycle } from '../utils/detectCycle';
import { buildAdjacencyList } from '../utils/graphHelpers';
import { canConnect } from '../utils/edgeHelpers';
import {
  createNode,
  generateNodeId,
  calculateChildPosition,
  calculateRootPosition,
} from '../utils/nodeHelpers';
import { collectSimulationSteps, simulateFlow } from '../utils/simulation';
import { getToastMessage, TOAST_MESSAGES } from '../utils/toastMessages';

import type { FlowStore, FlowNode, FlowEdge, FlowSnapshot } from '../types';

const SIMULATION_STEP_DELAY = 500;
const MAX_HISTORY = 50;

function getSmartPath(path: string[]): string {
  if (path.length <= 4) return path.join(' → ');
  return `${path[0]} → ${path[1]} → ... → ${path[path.length - 1]}`;
}

const initialState = {
  nodes: [] as FlowNode[],
  edges: [] as FlowEdge[],
  hasCycle: false,
  cycleNodes: new Set<string>(),
  cycleEdges: new Set<string>(),
  selectedNodeId: null as string | null,
  isSimulating: false,
  highlightedNodes: new Set<string>(),
  highlightedEdges: new Set<string>(),
  simulationModal: { open: false, content: null as string | null },
  past: [] as FlowSnapshot[],
  future: [] as FlowSnapshot[],
};

let simulationIntervalId: ReturnType<typeof setInterval> | null = null;

function clearSimulationInterval() {
  if (simulationIntervalId) {
    clearInterval(simulationIntervalId);
    simulationIntervalId = null;
  }
}

function createEdge(sourceId: string, targetId: string): FlowEdge {
  return {
    id: `e-${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
  };
}

function cloneNodes(nodes: FlowNode[]): FlowNode[] {
  return nodes.map((n) => ({
    ...n,
    position: { ...n.position },
    data: { ...n.data },
  }));
}

function cloneEdges(edges: FlowEdge[]): FlowEdge[] {
  return edges.map((e) => ({ ...e, data: e.data ? { ...e.data } : undefined }));
}

function captureSnapshot(nodes: FlowNode[], edges: FlowEdge[]): FlowSnapshot {
  return { nodes: cloneNodes(nodes), edges: cloneEdges(edges) };
}

function pushHistory(get: () => FlowStore, set: (fn: (state: FlowStore) => Partial<FlowStore>) => void) {
  const { past, nodes, edges, isSimulating } = get();
  if (isSimulating) return;
  const snapshot = captureSnapshot(nodes, edges);
  const nextPast = [...past, snapshot].slice(-MAX_HISTORY);
  set((state: FlowStore) => ({ ...state, past: nextPast, future: [] }));
}

export const useFlowStore = create<FlowStore>((set, get) => ({
  ...initialState,

  addNode: (parentId?: string) => {
    const { nodes, edges } = get();
    const newId = generateNodeId(nodes);
    pushHistory(get, set);

    const position = parentId
      ? calculateChildPosition(nodes, edges, parentId)
      : calculateRootPosition(nodes, edges);

    const newNode = createNode(newId, position);
    const newNodes = [...nodes, newNode];
    const newEdges = parentId ? [...edges, createEdge(parentId, newId)] : edges;

    set({ nodes: newNodes, edges: newEdges });
    get().runCycleDetection();
    toast.success(TOAST_MESSAGES.NODE_CREATED.title, { duration: 1500 });
  },

  updateNodeCondition: (nodeId: string, condition: string) => {
    const { nodes } = get();
    set({
      nodes: nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, condition } } : n
      ),
    });
  },

  deleteNode: (nodeId: string) => {
    const { nodes, edges } = get();
    pushHistory(get, set);

    set({
      nodes: nodes.filter((n) => n.id !== nodeId),
      edges: edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: null,
    });

    get().runCycleDetection();
    toast.success(TOAST_MESSAGES.NODE_DELETED.title, { duration: 1500 });
  },

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

  addEdge: (sourceId: string, targetId: string) => {
    const { nodes, edges } = get();
    const validation = canConnect(sourceId, targetId, nodes, edges);

    if (!validation.isValid) {
      if (validation.reason) {
        toast.error(getToastMessage(validation.reason).title);
      }
      return;
    }

    pushHistory(get, set);
    set({ edges: [...edges, createEdge(sourceId, targetId)] });
    get().runCycleDetection();
  },

  removeEdge: (edgeId: string) => {
    const { edges } = get();
    pushHistory(get, set);
    set({ edges: edges.filter((e) => e.id !== edgeId) });
    get().runCycleDetection();
    toast.success(TOAST_MESSAGES.EDGE_DELETED.title, { duration: 1500 });
  },

  onEdgesDelete: (deleted: FlowEdge[]) => {
    const { edges } = get();
    if (deleted.length === 0) return;
    const deleteIds = new Set(deleted.map((e) => e.id));
    pushHistory(get, set);
    set({ edges: edges.filter((e) => !deleteIds.has(e.id)) });
    get().runCycleDetection();
    toast.success(TOAST_MESSAGES.EDGE_DELETED.title, { duration: 1500 });
  },

  onNodesChange: (changes: NodeChange<FlowNode>[]) => {
    const { nodes, isSimulating, stopSimulation } = get();
    if (isSimulating) stopSimulation();
    set({ nodes: applyNodeChanges(changes, nodes) as FlowNode[] });
  },

  onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => {
    const { edges, isSimulating, stopSimulation } = get();
    if (isSimulating) stopSimulation();

    const nextEdges = applyEdgeChanges(changes, edges) as FlowEdge[];
    set({ edges: nextEdges });

    const structuralChange = changes.some((c) => c.type !== 'select');
    if (structuralChange) {
      get().runCycleDetection();
    }
  },

  onConnect: (connection: Connection) => {
    if (connection.source && connection.target) {
      get().addEdge(connection.source, connection.target);
    }
  },

  runCycleDetection: () => {
    const { nodes, edges } = get();
    const adjacencyList = buildAdjacencyList(edges);
    const result = detectCycle(nodes, adjacencyList);

    set({
      hasCycle: result.hasCycle,
      cycleNodes: result.cycleNodes,
      cycleEdges: result.cycleEdges,
    });
  },

  startSimulation: () => {
    const { nodes, edges, hasCycle, isSimulating } = get();

    if (isSimulating) {
      get().stopSimulation();
      return;
    }

    if (hasCycle) {
      toast.error('Cannot simulate: cycle detected', { duration: 2500 });
      return;
    }

    if (nodes.length === 0) {
      toast(TOAST_MESSAGES.SIMULATION_NO_NODES.title, { icon: '⚠️', duration: 2000 });
      return;
    }

    const hasEmpty = nodes.some((n) => !n.data?.condition?.trim());
    if (hasEmpty) {
      toast('Some nodes are empty. Please fill conditions for better simulation.', {
        icon: '📝',
        duration: 2000,
      });
    }

    const steps = collectSimulationSteps(nodes, edges);
    if (steps.length === 0) {
      toast('No valid path to simulate', { icon: '⚠️', duration: 2000 });
      return;
    }

    toast('Starting simulation...', { icon: '▶️', duration: 1500 });

    set({
      isSimulating: true,
      highlightedNodes: new Set(),
      highlightedEdges: new Set(),
    });

    let stepIndex = 0;
    const highlighted = { nodes: new Set<string>(), edges: new Set<string>() };

    simulationIntervalId = setInterval(() => {
      if (!get().isSimulating) {
        clearSimulationInterval();
        return;
      }

      if (stepIndex >= steps.length) {
        clearSimulationInterval();
        finishSimulation(nodes, edges);
        return;
      }

      const { nodeId, edgeId } = steps[stepIndex];
      highlighted.nodes.add(nodeId);
      if (edgeId) highlighted.edges.add(edgeId);

      set({
        highlightedNodes: new Set(highlighted.nodes),
        highlightedEdges: new Set(highlighted.edges),
      });

      stepIndex++;
    }, SIMULATION_STEP_DELAY);
  },

  stopSimulation: () => {
    clearSimulationInterval();
    set({
      isSimulating: false,
      highlightedNodes: new Set(),
      highlightedEdges: new Set(),
    });
  },

  resetFlow: () => {
    get().stopSimulation();
    pushHistory(get, set);
    set({
      nodes: [],
      edges: [],
      hasCycle: false,
      cycleNodes: new Set(),
      cycleEdges: new Set(),
      selectedNodeId: null,
      isSimulating: false,
      highlightedNodes: new Set(),
      highlightedEdges: new Set(),
      past: [],
      future: [],
      simulationModal: { open: false, content: null },
    });
    toast(TOAST_MESSAGES.FLOW_RESET.title, { icon: '🧹' });
  },

  undo: () => {
    const { past, future, nodes, edges, stopSimulation } = get();
    if (past.length === 0) return;
    stopSimulation();
    const snapshot = past[past.length - 1];
    const current = captureSnapshot(nodes, edges);
    set({
      nodes: cloneNodes(snapshot.nodes),
      edges: cloneEdges(snapshot.edges),
      past: past.slice(0, -1),
      future: [...future, current].slice(-MAX_HISTORY),
      selectedNodeId: null,
      highlightedNodes: new Set(),
      highlightedEdges: new Set(),
    });
    get().runCycleDetection();
  },

  redo: () => {
    const { past, future, nodes, edges, stopSimulation } = get();
    if (future.length === 0) return;
    stopSimulation();
    const snapshot = future[future.length - 1];
    const current = captureSnapshot(nodes, edges);
    set({
      nodes: cloneNodes(snapshot.nodes),
      edges: cloneEdges(snapshot.edges),
      past: [...past, current].slice(-MAX_HISTORY),
      future: future.slice(0, -1),
      selectedNodeId: null,
      highlightedNodes: new Set(),
      highlightedEdges: new Set(),
    });
    get().runCycleDetection();
  },

  showSimulationModal: (content: string) =>
    set((state) => ({ ...state, simulationModal: { open: true, content } })),

  closeSimulationModal: () =>
    set((state) => ({ ...state, simulationModal: { open: false, content: null } })),
}));

function finishSimulation(nodes: FlowNode[], edges: FlowEdge[]) {
  const result = simulateFlow(nodes, edges);

  if (result && result.path.length > 0) {
    const display = getSmartPath(result.path);
    const full = result.path.join(' → ');
    const { showSimulationModal } = useFlowStore.getState();

    toast.custom(
      (t) => (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg border border-slate-800 flex items-center gap-3">
          <div className="flex-1">
            <div className="text-sm font-semibold">Flow completed</div>
            <div className="text-xs text-slate-200 mt-0.5">{display}</div>
          </div>
          <button
            className="text-xs font-semibold text-emerald-200 hover:text-white underline"
            onClick={() => {
              showSimulationModal(full);
              toast.dismiss(t.id);
            }}
          >
            View full
          </button>
        </div>
      ),
      { duration: 0 }
    );
  }

  useFlowStore.setState({
    isSimulating: false,
    highlightedNodes: new Set(),
    highlightedEdges: new Set(),
  });
}
