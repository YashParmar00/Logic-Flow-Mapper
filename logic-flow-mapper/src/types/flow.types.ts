import type { Node, Edge, Connection, NodeChange, EdgeChange } from '@xyflow/react';

// Node types
export interface NodeData extends Record<string, unknown> {
  condition: string;
  isInCycle?: boolean;
  isHighlighted?: boolean;
}

export type FlowNode = Node<NodeData, 'custom'>;

// Edge types
export interface FlowEdge extends Edge {
  isInCycle?: boolean;
  isHighlighted?: boolean;
}

export interface FlowSnapshot {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// Graph algorithm types
export type AdjacencyList = Map<string, string[]>;

export interface CycleDetectionResult {
  hasCycle: boolean;
  cycleNodes: Set<string>;
  cycleEdges: Set<string>;
}

// Validation types
export type ConnectionInvalidReason =
  | 'self-loop'
  | 'duplicate'
  | 'would-create-cycle'
  | 'invalid-node';

export interface ConnectionValidationResult {
  isValid: boolean;
  reason?: ConnectionInvalidReason;
}

// Simulation types
export interface SimulationResult {
  path: string[];
  pathString: string;
  success: boolean;
}

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  type: ToastType;
  title: string;
  description?: string;
}

// Store types
export interface FlowState {
  nodes: FlowNode[];
  edges: FlowEdge[];
  hasCycle: boolean;
  cycleNodes: Set<string>;
  cycleEdges: Set<string>;
  selectedNodeId: string | null;
  isSimulating: boolean;
  highlightedNodes: Set<string>;
  highlightedEdges: Set<string>;
  simulationModal: { open: boolean; content: string | null };
  past: FlowSnapshot[];
  future: FlowSnapshot[];
}

export interface FlowActions {
  addNode: (parentId?: string) => void;
  updateNodeCondition: (nodeId: string, condition: string) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;
  addEdge: (sourceId: string, targetId: string) => void;
  removeEdge: (edgeId: string) => void;
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => void;
  onEdgesDelete: (deleted: FlowEdge[]) => void;
  onConnect: (connection: Connection) => void;
  runCycleDetection: () => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  resetFlow: () => void;
  undo: () => void;
  redo: () => void;
  showSimulationModal: (content: string) => void;
  closeSimulationModal: () => void;
}

export type FlowStore = FlowState & FlowActions;
