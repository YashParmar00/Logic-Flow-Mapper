# Logic Flow Mapper - Implementation Plan (Production Ready)

## Project Overview

Build a production-ready **Logic Flow Mapper** that allows users to create nested "If-Then" conditions with **proactive cycle prevention**, real-time validation, and user-friendly feedback. This is a technical assessment project demonstrating advanced React, TypeScript, and algorithm skills.

**Goal**: Make this feel like a real production tool, not just a technical assignment.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture Overview](#architecture-overview)
3. [Folder Structure](#folder-structure)
4. [Data Models & Types](#data-models--types)
5. [State Management (Zustand)](#state-management-zustand)
6. [Core Features](#core-features)
7. [Edge Validation (CRITICAL - Pre-Connection)](#edge-validation-critical---pre-connection)
8. [Cycle Detection Algorithm (Optimized)](#cycle-detection-algorithm-optimized)
9. [Node Positioning System](#node-positioning-system)
10. [Toast Notification System](#toast-notification-system)
11. [Simulation Engine (Enhanced with Path Highlighting)](#simulation-engine-enhanced-with-path-highlighting)
12. [Edge Visualization (Arrow Markers)](#edge-visualization-arrow-markers)
13. [Keyboard Shortcuts](#keyboard-shortcuts)
14. [Empty State UX](#empty-state-ux)
15. [Error Boundary](#error-boundary)
16. [Component Breakdown](#component-breakdown)
17. [Edge Case Handling](#edge-case-handling)
18. [Performance Optimizations](#performance-optimizations)
19. [UI/UX Design (Polished)](#uiux-design-polished)
20. [Implementation Phases](#implementation-phases)
21. [Testing Strategy](#testing-strategy)
22. [Deliverables Checklist](#deliverables-checklist)

---

## Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI Framework | 18.x |
| TypeScript | Type Safety | 5.x |
| @xyflow/react | Flow Visualization | Latest |
| Zustand | State Management | 4.x |
| Tailwind CSS | Styling | 3.x |
| Vite | Build Tool | 5.x |
| react-hot-toast | Toast Notifications | 2.x |

### Why These Choices?

- **React + TypeScript**: Industry standard, strong typing for complex data structures
- **@xyflow/react**: Modern fork of ReactFlow with better performance and API
- **Zustand**: Lightweight, minimal boilerplate, excellent for complex state
- **Tailwind CSS**: Utility-first, rapid development, consistent design
- **react-hot-toast**: Lightweight, customizable toast notifications for user feedback

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                         App.tsx                              ││
│  │  ┌─────────────┐  ┌─────────────────────────────────────┐   ││
│  │  │  Toolbar    │  │         FlowCanvas                  │   ││
│  │  │  - Add Node │  │  ┌─────────────────────────────┐    │   ││
│  │  │  - Simulate │  │  │      ReactFlow Provider     │    │   ││
│  │  └─────────────┘  │  │  ┌───────┐  ┌───────┐       │    │   ││
│  │                   │  │  │ Node  │──│ Node  │       │    │   ││
│  │  ┌─────────────┐  │  │  └───────┘  └───────┘       │    │   ││
│  │  │ Toast       │  │  └─────────────────────────────┘    │   ││
│  │  │ Container   │  └─────────────────────────────────────┘   ││
│  │  └─────────────┘                                            ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                        STATE LAYER (Zustand)                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  useFlowStore                                                ││
│  │  - nodes: FlowNode[]                                         ││
│  │  - edges: FlowEdge[]                                         ││
│  │  - hasCycle: boolean                                         ││
│  │  - cycleNodes: Set<string>                                   ││
│  │  - canConnect: (source, target) => boolean  ← NEW            ││
│  │  - actions: addNode, deleteNode, addEdge, etc.               ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                        LOGIC LAYER (Utils)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ detectCycle  │  │ graphHelpers │  │ edgeHelpers  │           │
│  │ (Optimized)  │  │ + pathExists │  │ + canConnect │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ nodeHelpers  │  │ simulation   │  │ toastHelpers │           │
│  │ + positioning│  │ + traversal  │  │ + messages   │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Separation of Concerns**: UI, State, and Logic are completely separated
2. **Single Source of Truth**: Zustand store holds all flow state
3. **Pure Functions**: All graph algorithms are pure, testable functions
4. **Immutability**: All state updates create new objects
5. **Memoization**: Prevent unnecessary re-renders
6. **Proactive Validation**: Prevent cycles BEFORE edge creation (not after)
7. **User Feedback**: Visual toast notifications instead of console.warn

---

## Folder Structure

```
/src
├── /components
│   ├── /nodes
│   │   ├── CustomNode.tsx          # Main custom node component
│   │   ├── NodeToolbar.tsx         # Node action buttons (add child, delete)
│   │   └── index.ts                # Barrel export
│   │
│   ├── /flow
│   │   ├── FlowCanvas.tsx          # ReactFlow canvas wrapper
│   │   ├── FlowControls.tsx        # Zoom, fit view, minimap controls
│   │   ├── FlowToolbar.tsx         # Top toolbar (add root, simulate)
│   │   ├── EmptyState.tsx          # NEW: Empty canvas state
│   │   └── index.ts
│   │
│   └── /ui
│       ├── Button.tsx              # Reusable button component
│       ├── Input.tsx               # Reusable input component
│       ├── Toast.tsx               # Custom toast component
│       ├── ErrorBoundary.tsx       # NEW: Error boundary wrapper
│       └── index.ts
│
├── /store
│   ├── useFlowStore.ts             # Main Zustand store
│   ├── selectors.ts                # Memoized selectors
│   └── index.ts
│
├── /utils
│   ├── detectCycle.ts              # OPTIMIZED DFS cycle detection
│   ├── graphHelpers.ts             # Build adjacency list, pathExists
│   ├── edgeHelpers.ts              # Edge validation, canConnect
│   ├── nodeHelpers.ts              # Node creation, positioning
│   ├── simulation.ts               # Flow traversal simulation
│   ├── toastMessages.ts            # User-facing messages
│   └── index.ts
│
├── /types
│   ├── flow.types.ts               # FlowNode, FlowEdge, FlowState
│   └── index.ts
│
├── /hooks
│   ├── useCycleDetection.ts        # Hook wrapping cycle detection
│   ├── useNodeActions.ts           # Hook for node CRUD operations
│   ├── useFlowCallbacks.ts         # ReactFlow event handlers
│   ├── useConnectionValidation.ts  # isValidConnection hook
│   ├── useKeyboardShortcuts.ts     # NEW: Keyboard shortcuts hook
│   └── index.ts
│
├── /constants
│   ├── flow.constants.ts           # Default values, config
│   ├── positioning.constants.ts    # Node positioning config
│   ├── edge.constants.ts           # NEW: Edge styling constants
│   └── index.ts
│
├── App.tsx                         # Root component
├── main.tsx                        # Entry point
└── index.css                       # Tailwind imports
```

---

## Data Models & Types

### Core Types (`/types/flow.types.ts`)

```typescript
// ============================================
// NODE TYPES
// ============================================

export interface NodeData {
  condition: string;
  isInCycle?: boolean;  // For visual highlighting
}

export interface FlowNode {
  id: string;
  type: 'custom';
  data: NodeData;
  position: {
    x: number;
    y: number;
  };
}

// ============================================
// EDGE TYPES
// ============================================

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: React.CSSProperties;
  isInCycle?: boolean;  // For visual highlighting
}

// ============================================
// GRAPH TYPES (for algorithms)
// ============================================

export type AdjacencyList = Map<string, string[]>;

export interface CycleDetectionResult {
  hasCycle: boolean;
  cycleNodes: Set<string>;
  cycleEdges: Set<string>;
}

// ============================================
// CONNECTION VALIDATION TYPES (NEW)
// ============================================

export type ConnectionValidationResult = {
  isValid: boolean;
  reason?: 'self-loop' | 'duplicate' | 'would-create-cycle' | 'invalid-node';
};

// ============================================
// SIMULATION TYPES (NEW)
// ============================================

export interface SimulationResult {
  path: string[];
  pathString: string;  // "A → B → C"
  success: boolean;
}

// ============================================
// TOAST TYPES (NEW)
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  type: ToastType;
  title: string;
  description?: string;
}

// ============================================
// STORE TYPES
// ============================================

export interface FlowState {
  // Data
  nodes: FlowNode[];
  edges: FlowEdge[];

  // Cycle detection state
  hasCycle: boolean;
  cycleNodes: Set<string>;
  cycleEdges: Set<string>;

  // Selected state
  selectedNodeId: string | null;

  // Simulation state (NEW)
  isSimulating: boolean;
  simulationPath: string[];
  highlightedNodes: Set<string>;
  highlightedEdges: Set<string>;
}

export interface FlowActions {
  // Node actions
  addNode: (parentId?: string) => void;
  updateNodeCondition: (nodeId: string, condition: string) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (nodeId: string | null) => void;

  // Edge actions
  addEdge: (sourceId: string, targetId: string) => void;
  removeEdge: (edgeId: string) => void;

  // Connection validation (NEW - CRITICAL)
  canConnect: (sourceId: string, targetId: string) => boolean;

  // ReactFlow callbacks
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Cycle management
  runCycleDetection: () => void;

  // Simulation (Enhanced)
  simulateFlow: () => SimulationResult | null;
  startSimulation: () => void;
  stopSimulation: () => void;

  // Reset
  resetFlow: () => void;
}

export type FlowStore = FlowState & FlowActions;
```

---

## Edge Validation (CRITICAL - Pre-Connection)

### The Problem with Post-Connection Detection

**OLD APPROACH (Bad):**
```
User connects A → B → C → A
→ Edge is created
→ Cycle detection runs
→ Cycle found
→ UI shows red highlighting
→ User must manually delete the edge
```

**NEW APPROACH (Good):**
```
User tries to connect C → A
→ canConnect() checks if A can reach C
→ YES! A → B → C exists
→ Connection BLOCKED before creation
→ Toast shows: "Cannot connect: would create a cycle"
→ No cleanup needed
```

### Implementation (`/utils/edgeHelpers.ts`)

```typescript
import type { FlowNode, FlowEdge, AdjacencyList, ConnectionValidationResult } from '../types';
import { buildAdjacencyList, pathExists } from './graphHelpers';

/**
 * CRITICAL: Validates if a connection can be made BEFORE creating the edge
 * This prevents cycles from ever being created in the first place
 */
export function canConnect(
  sourceId: string,
  targetId: string,
  nodes: FlowNode[],
  edges: FlowEdge[]
): ConnectionValidationResult {
  // Check 1: Self-loop
  if (sourceId === targetId) {
    return { isValid: false, reason: 'self-loop' };
  }

  // Check 2: Nodes exist
  const sourceExists = nodes.some(n => n.id === sourceId);
  const targetExists = nodes.some(n => n.id === targetId);
  if (!sourceExists || !targetExists) {
    return { isValid: false, reason: 'invalid-node' };
  }

  // Check 3: Duplicate edge
  const edgeExists = edges.some(
    e => e.source === sourceId && e.target === targetId
  );
  if (edgeExists) {
    return { isValid: false, reason: 'duplicate' };
  }

  // Check 4: CRITICAL - Would this create a cycle?
  // If TARGET can reach SOURCE, adding SOURCE → TARGET creates a cycle
  const adjacencyList = buildAdjacencyList(edges);
  if (pathExists(targetId, sourceId, adjacencyList)) {
    return { isValid: false, reason: 'would-create-cycle' };
  }

  return { isValid: true };
}

/**
 * Validates that both source and target nodes exist
 */
export function isValidEdge(
  sourceId: string,
  targetId: string,
  nodes: FlowNode[]
): boolean {
  const sourceExists = nodes.some(n => n.id === sourceId);
  const targetExists = nodes.some(n => n.id === targetId);
  return sourceExists && targetExists;
}

/**
 * Checks if an edge already exists
 */
export function isDuplicateEdge(
  sourceId: string,
  targetId: string,
  edges: FlowEdge[]
): boolean {
  return edges.some(
    e => e.source === sourceId && e.target === targetId
  );
}

/**
 * Checks if adding this edge would create a self-loop
 */
export function isSelfLoop(sourceId: string, targetId: string): boolean {
  return sourceId === targetId;
}

/**
 * Gets all edges connected to a node (incoming and outgoing)
 */
export function getConnectedEdges(
  nodeId: string,
  edges: FlowEdge[]
): FlowEdge[] {
  return edges.filter(
    e => e.source === nodeId || e.target === nodeId
  );
}
```

### React Flow Integration - isValidConnection

```typescript
// In FlowCanvas.tsx

import { useCallback } from 'react';
import { Connection } from '@xyflow/react';
import { useFlowStore } from '../../store';
import toast from 'react-hot-toast';
import { getToastMessage } from '../../utils/toastMessages';

export function FlowCanvas() {
  const { nodes, edges, canConnect } = useFlowStore();

  /**
   * CRITICAL: This callback is called by React Flow BEFORE creating an edge
   * Return false to prevent the connection entirely
   */
  const isValidConnection = useCallback(
    (connection: Connection): boolean => {
      if (!connection.source || !connection.target) return false;

      const validation = canConnect(connection.source, connection.target);

      if (!validation.isValid && validation.reason) {
        // Show user-friendly toast instead of console.warn
        const message = getToastMessage(validation.reason);
        toast.error(message.title, {
          description: message.description,
          duration: 3000,
        });
        return false;
      }

      return true;
    },
    [canConnect]
  );

  return (
    <ReactFlow
      nodes={styledNodes}
      edges={styledEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      isValidConnection={isValidConnection}  // ← CRITICAL
      nodeTypes={nodeTypes}
      fitView
    >
      {/* ... */}
    </ReactFlow>
  );
}
```

---

## Cycle Detection Algorithm (Optimized)

### Problem with Original Implementation

**OLD (Inefficient):**
```typescript
// Creates new array on every recursive call - O(n) memory per call
dfs(neighbor, [...path]);  // BAD: array spread creates copy
```

**NEW (Optimized):**
```typescript
// Uses push/pop - O(1) per operation
path.push(nodeId);
dfs(neighbor, path);
path.pop();  // GOOD: mutate in place
```

### Optimized DFS Implementation (`/utils/detectCycle.ts`)

```typescript
import type { FlowNode, AdjacencyList, CycleDetectionResult } from '../types';

/**
 * Detects cycles in a directed graph using OPTIMIZED DFS
 *
 * OPTIMIZATIONS:
 * 1. Use push/pop instead of [...path] spread (O(1) vs O(n))
 * 2. Early termination when cycle found
 * 3. Single pass through all nodes
 *
 * Time Complexity: O(V + E)
 * Space Complexity: O(V) - only one path array, reused
 */
export function detectCycle(
  nodes: FlowNode[],
  adjacencyList: AdjacencyList
): CycleDetectionResult {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycleNodes = new Set<string>();
  const cycleEdges = new Set<string>();
  let hasCycle = false;

  // Reusable path array - push/pop instead of creating copies
  const path: string[] = [];

  function dfs(nodeId: string): void {
    // Mark node as visited and add to recursion stack
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);  // O(1) push

    // Get neighbors
    const neighbors = adjacencyList.get(nodeId) || [];

    for (const neighbor of neighbors) {
      // Self-loop detection
      if (neighbor === nodeId) {
        hasCycle = true;
        cycleNodes.add(nodeId);
        cycleEdges.add(`e-${nodeId}-${neighbor}`);
        continue;
      }

      // If neighbor is in recursion stack, we found a cycle
      if (recursionStack.has(neighbor)) {
        hasCycle = true;

        // Mark all nodes in the cycle
        const cycleStartIndex = path.indexOf(neighbor);
        for (let i = cycleStartIndex; i < path.length; i++) {
          cycleNodes.add(path[i]);
          // Mark edge from current to next in cycle
          if (i < path.length - 1) {
            cycleEdges.add(`e-${path[i]}-${path[i + 1]}`);
          }
        }
        // Mark edge that closes the cycle
        cycleEdges.add(`e-${path[path.length - 1]}-${neighbor}`);
        continue;
      }

      // If not visited, recurse
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }

    // Remove from recursion stack AND path when backtracking
    recursionStack.delete(nodeId);
    path.pop();  // O(1) pop - OPTIMIZED: no array copy
  }

  // Run DFS from each unvisited node
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  }

  return {
    hasCycle,
    cycleNodes,
    cycleEdges,
  };
}
```

### Graph Helpers with pathExists (`/utils/graphHelpers.ts`)

```typescript
import type { FlowEdge, AdjacencyList } from '../types';

/**
 * Builds an adjacency list from edges
 * Used for efficient graph traversal
 */
export function buildAdjacencyList(edges: FlowEdge[]): AdjacencyList {
  const adjacencyList: AdjacencyList = new Map();

  for (const edge of edges) {
    if (!adjacencyList.has(edge.source)) {
      adjacencyList.set(edge.source, []);
    }
    adjacencyList.get(edge.source)!.push(edge.target);
  }

  return adjacencyList;
}

/**
 * CRITICAL: Checks if a path exists from source to target
 * Used to prevent cycles BEFORE edge creation
 *
 * If pathExists(target, source) is true, then adding source → target
 * would create a cycle: source → target → ... → source
 *
 * Uses BFS for breadth-first traversal (finds path efficiently)
 */
export function pathExists(
  sourceId: string,
  targetId: string,
  adjacencyList: AdjacencyList
): boolean {
  // Same node = path exists (self-loop check)
  if (sourceId === targetId) {
    return true;
  }

  const visited = new Set<string>();
  const queue: string[] = [sourceId];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current === targetId) {
      return true;
    }

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);
    const neighbors = adjacencyList.get(current) || [];

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }

  return false;
}

/**
 * Gets all descendants of a node using BFS
 * Useful for cascade delete or selection
 */
export function getDescendants(
  nodeId: string,
  adjacencyList: AdjacencyList
): Set<string> {
  const descendants = new Set<string>();
  const queue = [nodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = adjacencyList.get(current) || [];

    for (const child of children) {
      if (!descendants.has(child)) {
        descendants.add(child);
        queue.push(child);
      }
    }
  }

  return descendants;
}

/**
 * Gets all root nodes (nodes with no incoming edges)
 * Used for simulation starting points
 */
export function getRootNodes(
  nodes: FlowNode[],
  edges: FlowEdge[]
): FlowNode[] {
  const nodesWithIncoming = new Set(edges.map(e => e.target));
  return nodes.filter(n => !nodesWithIncoming.has(n.id));
}
```

---

## Node Positioning System

### Constants (`/constants/positioning.constants.ts`)

```typescript
export const POSITIONING = {
  // Horizontal offset for child nodes
  CHILD_X_OFFSET: 250,

  // Vertical spacing between siblings
  SIBLING_Y_OFFSET: 120,

  // Default root node position
  ROOT_POSITION: { x: 100, y: 100 },

  // Minimum spacing to prevent overlap
  MIN_SPACING: 80,

  // Node dimensions (approximate)
  NODE_WIDTH: 200,
  NODE_HEIGHT: 120,
} as const;
```

### Node Positioning Implementation (`/utils/nodeHelpers.ts`)

```typescript
import type { FlowNode, FlowEdge } from '../types';
import { POSITIONING } from '../constants/positioning.constants';

/**
 * Generates a unique node ID
 */
export function generateNodeId(nodes: FlowNode[]): string {
  const maxId = nodes.reduce((max, node) => {
    const numericId = parseInt(node.id.replace('node-', ''), 10);
    return isNaN(numericId) ? max : Math.max(max, numericId);
  }, 0);
  return `node-${maxId + 1}`;
}

/**
 * Creates a new node with default data
 */
export function createNode(
  id: string,
  position: { x: number; y: number }
): FlowNode {
  return {
    id,
    type: 'custom',
    data: {
      condition: '',
      isInCycle: false,
    },
    position,
  };
}

/**
 * Calculates position for a new child node
 *
 * Strategy:
 * 1. Place child to the right of parent (x + CHILD_X_OFFSET)
 * 2. Calculate vertical position based on existing siblings
 * 3. Prevent overlap with existing nodes
 */
export function calculateChildPosition(
  nodes: FlowNode[],
  edges: FlowEdge[],
  parentId: string
): { x: number; y: number } {
  const parent = nodes.find(n => n.id === parentId);
  if (!parent) {
    return POSITIONING.ROOT_POSITION;
  }

  // Get existing children of this parent
  const existingChildren = edges
    .filter(e => e.source === parentId)
    .map(e => nodes.find(n => n.id === e.target))
    .filter((n): n is FlowNode => n !== undefined);

  // Base X position: parent.x + offset
  const baseX = parent.position.x + POSITIONING.CHILD_X_OFFSET;

  // Calculate Y position
  let baseY: number;

  if (existingChildren.length === 0) {
    // First child: align with parent
    baseY = parent.position.y;
  } else {
    // Find the lowest existing child and place below it
    const lowestChild = existingChildren.reduce((lowest, child) =>
      child.position.y > lowest.position.y ? child : lowest
    );
    baseY = lowestChild.position.y + POSITIONING.SIBLING_Y_OFFSET;
  }

  // Check for overlaps with ANY node and adjust
  const position = preventOverlap(nodes, { x: baseX, y: baseY });

  return position;
}

/**
 * Prevents node overlap by checking existing positions
 * Shifts the node down if overlap detected
 */
export function preventOverlap(
  nodes: FlowNode[],
  proposedPosition: { x: number; y: number }
): { x: number; y: number } {
  let { x, y } = proposedPosition;
  let hasOverlap = true;
  let iterations = 0;
  const maxIterations = 100; // Safety limit

  while (hasOverlap && iterations < maxIterations) {
    hasOverlap = false;

    for (const node of nodes) {
      const xOverlap = Math.abs(node.position.x - x) < POSITIONING.NODE_WIDTH;
      const yOverlap = Math.abs(node.position.y - y) < POSITIONING.NODE_HEIGHT;

      if (xOverlap && yOverlap) {
        // Shift down to avoid overlap
        y = node.position.y + POSITIONING.NODE_HEIGHT + POSITIONING.MIN_SPACING;
        hasOverlap = true;
        break;
      }
    }

    iterations++;
  }

  return { x, y };
}

/**
 * Calculate position for a new root node
 * Places it below existing root nodes
 */
export function calculateRootPosition(
  nodes: FlowNode[],
  edges: FlowEdge[]
): { x: number; y: number } {
  if (nodes.length === 0) {
    return POSITIONING.ROOT_POSITION;
  }

  // Find nodes with no incoming edges (roots)
  const nodesWithIncoming = new Set(edges.map(e => e.target));
  const rootNodes = nodes.filter(n => !nodesWithIncoming.has(n.id));

  if (rootNodes.length === 0) {
    // All nodes have parents, place new root at default
    return POSITIONING.ROOT_POSITION;
  }

  // Find the lowest root node
  const lowestRoot = rootNodes.reduce((lowest, root) =>
    root.position.y > lowest.position.y ? root : lowest
  );

  return preventOverlap(nodes, {
    x: POSITIONING.ROOT_POSITION.x,
    y: lowestRoot.position.y + POSITIONING.SIBLING_Y_OFFSET,
  });
}
```

---

## Toast Notification System

### Toast Messages (`/utils/toastMessages.ts`)

```typescript
import type { ToastMessage } from '../types';

type ValidationReason = 'self-loop' | 'duplicate' | 'would-create-cycle' | 'invalid-node';

/**
 * User-friendly toast messages for different validation failures
 */
export function getToastMessage(reason: ValidationReason): ToastMessage {
  switch (reason) {
    case 'self-loop':
      return {
        type: 'error',
        title: 'Self-loop not allowed',
        description: 'A node cannot connect to itself.',
      };

    case 'duplicate':
      return {
        type: 'warning',
        title: 'Connection already exists',
        description: 'These nodes are already connected.',
      };

    case 'would-create-cycle':
      return {
        type: 'error',
        title: 'Would create a loop',
        description: 'This connection would create a circular logic path.',
      };

    case 'invalid-node':
      return {
        type: 'error',
        title: 'Invalid connection',
        description: 'One or both nodes do not exist.',
      };

    default:
      return {
        type: 'error',
        title: 'Connection failed',
        description: 'Unable to create this connection.',
      };
  }
}

/**
 * Success messages
 */
export const TOAST_MESSAGES = {
  NODE_CREATED: {
    type: 'success' as const,
    title: 'Node created',
  },
  NODE_DELETED: {
    type: 'success' as const,
    title: 'Node deleted',
  },
  CONNECTION_CREATED: {
    type: 'success' as const,
    title: 'Connection created',
  },
  SIMULATION_SUCCESS: {
    type: 'success' as const,
    title: 'Simulation complete',
    description: 'Logic flow executed successfully.',
  },
  SIMULATION_NO_NODES: {
    type: 'warning' as const,
    title: 'No nodes to simulate',
    description: 'Add some nodes first.',
  },
  FLOW_RESET: {
    type: 'info' as const,
    title: 'Flow reset',
    description: 'All nodes and connections cleared.',
  },
};
```

### Toast Integration in App

```typescript
// App.tsx
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      <ReactFlowProvider>
        <FlowToolbar />
        <FlowCanvas />
      </ReactFlowProvider>

      {/* Toast container */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}
```

---

## Simulation Engine (Enhanced with Path Highlighting)

### Flow Traversal Implementation (`/utils/simulation.ts`)

```typescript
import type { FlowNode, FlowEdge, AdjacencyList, SimulationResult } from '../types';
import { buildAdjacencyList, getRootNodes } from './graphHelpers';

/**
 * Simulates the logic flow by traversing the graph
 *
 * Strategy:
 * 1. Find all root nodes (no incoming edges)
 * 2. Traverse using DFS from each root
 * 3. Build execution path
 * 4. Log path to console
 *
 * @returns SimulationResult with path and formatted string
 */
export function simulateFlow(
  nodes: FlowNode[],
  edges: FlowEdge[]
): SimulationResult | null {
  if (nodes.length === 0) {
    return null;
  }

  const adjacencyList = buildAdjacencyList(edges);
  const rootNodes = getRootNodes(nodes, edges);

  // If no root nodes (all nodes have parents), start from first node
  const startNodes = rootNodes.length > 0 ? rootNodes : [nodes[0]];

  const visited = new Set<string>();
  const executionPath: string[] = [];

  // DFS traversal
  function traverse(nodeId: string): void {
    if (visited.has(nodeId)) return;

    visited.add(nodeId);
    const node = nodes.find(n => n.id === nodeId);

    // Add to path with condition or ID
    const label = node?.data.condition || nodeId;
    executionPath.push(label);

    // Visit all children
    const children = adjacencyList.get(nodeId) || [];
    for (const child of children) {
      traverse(child);
    }
  }

  // Start traversal from each root
  for (const root of startNodes) {
    traverse(root.id);
  }

  // Build path string
  const pathString = executionPath.join(' → ');

  // Log to console with styling
  console.group('🚀 Logic Flow Simulation');
  console.log('%cExecution Path:', 'font-weight: bold; color: #10b981;');
  console.log(pathString);
  console.log('%cNodes visited:', 'font-weight: bold;', executionPath.length);
  console.groupEnd();

  return {
    path: executionPath,
    pathString,
    success: true,
  };
}

/**
 * Validates that the flow can be simulated
 * Returns false if there are cycles or no nodes
 */
export function canSimulate(
  nodes: FlowNode[],
  hasCycle: boolean
): { canRun: boolean; reason?: string } {
  if (nodes.length === 0) {
    return { canRun: false, reason: 'No nodes in the flow' };
  }

  if (hasCycle) {
    return { canRun: false, reason: 'Flow contains a cycle' };
  }

  return { canRun: true };
}
```

### Enhanced Simulation with Path Highlighting

```typescript
export function simulateFlowWithHighlighting(
  nodes: FlowNode[],
  edges: FlowEdge[],
  onStep: (nodeId: string, edgeIds: string[]) => void,
  delay: number = 500
): Promise<SimulationResult> {
  return new Promise((resolve) => {
    if (nodes.length === 0) {
      resolve({ path: [], pathString: '', success: false });
      return;
    }

    const adjacencyList = buildAdjacencyList(edges);
    const rootNodes = getRootNodes(nodes, edges);
    const startNodes = rootNodes.length > 0 ? rootNodes : [nodes[0]];

    const visited = new Set<string>();
    const executionPath: string[] = [];
    const visitOrder: { nodeId: string; edgeId?: string }[] = [];

    function collectPath(nodeId: string, incomingEdgeId?: string): void {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodes.find(n => n.id === nodeId);
      executionPath.push(node?.data.condition || nodeId);
      visitOrder.push({ nodeId, edgeId: incomingEdgeId });

      const children = adjacencyList.get(nodeId) || [];
      for (const child of children) {
        const edgeId = `e-${nodeId}-${child}`;
        collectPath(child, edgeId);
      }
    }

    for (const root of startNodes) {
      collectPath(root.id);
    }

    let stepIndex = 0;
    const highlightedNodes = new Set<string>();
    const highlightedEdges = new Set<string>();

    const interval = setInterval(() => {
      if (stepIndex >= visitOrder.length) {
        clearInterval(interval);
        resolve({
          path: executionPath,
          pathString: executionPath.join(' → '),
          success: true,
        });
        return;
      }

      const { nodeId, edgeId } = visitOrder[stepIndex];
      highlightedNodes.add(nodeId);
      if (edgeId) highlightedEdges.add(edgeId);

      onStep(nodeId, Array.from(highlightedEdges));
      stepIndex++;
    }, delay);
  });
}
```

### Store Actions for Simulation State

```typescript
// Add to useFlowStore.ts

startSimulation: () => {
  const { nodes, edges, hasCycle } = get();

  if (hasCycle || nodes.length === 0) {
    toast.error(hasCycle ? 'Cannot simulate with cycles' : 'Add nodes first');
    return;
  }

  set({ isSimulating: true, highlightedNodes: new Set(), highlightedEdges: new Set() });

  simulateFlowWithHighlighting(
    nodes,
    edges,
    (nodeId, edgeIds) => {
      set((state) => {
        state.highlightedNodes.add(nodeId);
        edgeIds.forEach(id => state.highlightedEdges.add(id));
      });
    },
    400
  ).then((result) => {
    set({ isSimulating: false });
    if (result.success) {
      toast.success(`Executed: ${result.pathString}`, { duration: 4000 });
    }
  });
},

stopSimulation: () => {
  set({
    isSimulating: false,
    highlightedNodes: new Set(),
    highlightedEdges: new Set(),
  });
},
```

---

## Edge Visualization (Arrow Markers)

### Edge Constants (`/constants/edge.constants.ts`)

```typescript
export const EDGE_STYLES = {
  default: {
    stroke: '#64748b',
    strokeWidth: 2,
  },
  cycle: {
    stroke: '#ef4444',
    strokeWidth: 2,
  },
  highlighted: {
    stroke: '#10b981',
    strokeWidth: 3,
  },
} as const;

export const MARKER_CONFIG = {
  type: MarkerType.ArrowClosed,
  width: 20,
  height: 20,
  color: '#64748b',
} as const;
```

### Edge Options in FlowCanvas

```typescript
import { MarkerType } from '@xyflow/react';

const defaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#64748b',
  },
  style: {
    strokeWidth: 2,
    stroke: '#64748b',
  },
};

const styledEdges = useMemo(() =>
  edges.map(edge => {
    const isInCycle = cycleEdges.has(edge.id);
    const isHighlighted = highlightedEdges.has(edge.id);

    let style = { ...EDGE_STYLES.default };
    let markerColor = '#64748b';

    if (isInCycle) {
      style = { ...EDGE_STYLES.cycle };
      markerColor = '#ef4444';
    } else if (isHighlighted) {
      style = { ...EDGE_STYLES.highlighted };
      markerColor = '#10b981';
    }

    return {
      ...edge,
      type: 'smoothstep',
      animated: isInCycle || isHighlighted,
      style,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: markerColor,
      },
    };
  }),
  [edges, cycleEdges, highlightedEdges]
);
```

---

## Keyboard Shortcuts

### Keyboard Shortcuts Hook (`/hooks/useKeyboardShortcuts.ts`)

```typescript
import { useEffect, useCallback } from 'react';
import { useFlowStore } from '../store';

export function useKeyboardShortcuts() {
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const deleteNode = useFlowStore((state) => state.deleteNode);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (!isInputFocused && selectedNodeId) {
          event.preventDefault();
          deleteNode(selectedNodeId);
        }
      }
    },
    [selectedNodeId, deleteNode]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
```

### Enter Key in CustomNode Input

```typescript
// In CustomNode.tsx

const handleKeyDown = useCallback(
  (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNode(id);
    }
  },
  [id, addNode]
);

// In the input element:
<input
  type="text"
  value={data.condition}
  onChange={handleConditionChange}
  onKeyDown={handleKeyDown}
  placeholder="Enter condition... (Press Enter to add child)"
  className="..."
/>
```

### Integration in FlowCanvas

```typescript
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export function FlowCanvas() {
  useKeyboardShortcuts();

  // ... rest of component
}
```

---

## Empty State UX

### EmptyState Component (`/components/flow/EmptyState.tsx`)

```typescript
import { useFlowStore } from '../../store';

export function EmptyState() {
  const addNode = useFlowStore((state) => state.addNode);

  const handleAddFirstNode = () => {
    addNode();
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="text-center pointer-events-auto">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-700 mb-2">
          No nodes yet
        </h3>
        <p className="text-slate-500 mb-6 max-w-xs">
          Start building your logic flow by adding your first node
        </p>
        <button
          onClick={handleAddFirstNode}
          className="px-6 py-2.5 bg-blue-500 text-white rounded-lg font-medium
                     hover:bg-blue-600 active:bg-blue-700
                     transition-all duration-200 shadow-sm hover:shadow-md"
        >
          + Add First Node
        </button>
      </div>
    </div>
  );
}
```

### Integration in FlowCanvas

```typescript
import { EmptyState } from './EmptyState';

export function FlowCanvas() {
  const nodes = useFlowStore((state) => state.nodes);
  // ... other hooks

  return (
    <div className="flex-1 relative">
      {nodes.length === 0 && <EmptyState />}

      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        // ... other props
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
```

---

## Error Boundary

### ErrorBoundary Component (`/components/ui/ErrorBoundary.tsx`)

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Flow Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex-1 flex items-center justify-center bg-slate-50">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-600 mb-6">
              An unexpected error occurred in the flow editor.
              Your work may not be saved.
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 bg-slate-800 text-white rounded-lg font-medium
                         hover:bg-slate-700 transition-colors"
            >
              Reload Application
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-6 p-4 bg-slate-100 rounded-lg text-left text-xs text-red-600 overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Integration in App.tsx

```typescript
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      <ReactFlowProvider>
        <FlowToolbar />
        <ErrorBoundary>
          <FlowCanvas />
        </ErrorBoundary>
      </ReactFlowProvider>

      <Toaster ... />
    </div>
  );
}
```

---

## State Management (Zustand) - Updated

### Store Implementation with All Enhancements (`/store/useFlowStore.ts`)

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import toast from 'react-hot-toast';

import { detectCycle } from '../utils/detectCycle';
import { buildAdjacencyList, pathExists } from '../utils/graphHelpers';
import { canConnect as validateConnection } from '../utils/edgeHelpers';
import {
  createNode,
  generateNodeId,
  calculateChildPosition,
  calculateRootPosition,
} from '../utils/nodeHelpers';
import { simulateFlow } from '../utils/simulation';
import { getToastMessage, TOAST_MESSAGES } from '../utils/toastMessages';

import type { FlowStore, FlowNode, FlowEdge, SimulationResult } from '../types';

const initialState = {
  nodes: [] as FlowNode[],
  edges: [] as FlowEdge[],
  hasCycle: false,
  cycleNodes: new Set<string>(),
  cycleEdges: new Set<string>(),
  selectedNodeId: null as string | null,
};

export const useFlowStore = create<FlowStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,

      // ========== NODE ACTIONS ==========

      addNode: (parentId?: string) => {
        set((state) => {
          const newId = generateNodeId(state.nodes);

          // Calculate position based on parent or as root
          const position = parentId
            ? calculateChildPosition(state.nodes, state.edges, parentId)
            : calculateRootPosition(state.nodes, state.edges);

          const newNode = createNode(newId, position);
          state.nodes.push(newNode);

          // Auto-connect to parent if provided
          if (parentId) {
            state.edges.push({
              id: `e-${parentId}-${newId}`,
              source: parentId,
              target: newId,
            });
          }
        });

        // Run cycle detection (shouldn't find any since we validate)
        get().runCycleDetection();

        // Show success toast
        toast.success(TOAST_MESSAGES.NODE_CREATED.title, { duration: 1500 });
      },

      updateNodeCondition: (nodeId: string, condition: string) => {
        set((state) => {
          const node = state.nodes.find(n => n.id === nodeId);
          if (node) {
            node.data.condition = condition;
          }
        });
      },

      deleteNode: (nodeId: string) => {
        set((state) => {
          // Remove node
          state.nodes = state.nodes.filter(n => n.id !== nodeId);
          // Remove all connected edges
          state.edges = state.edges.filter(
            e => e.source !== nodeId && e.target !== nodeId
          );
        });

        get().runCycleDetection();
        toast.success(TOAST_MESSAGES.NODE_DELETED.title, { duration: 1500 });
      },

      setSelectedNode: (nodeId: string | null) => {
        set({ selectedNodeId: nodeId });
      },

      // ========== CONNECTION VALIDATION (CRITICAL) ==========

      canConnect: (sourceId: string, targetId: string): boolean => {
        const { nodes, edges } = get();
        const validation = validateConnection(sourceId, targetId, nodes, edges);
        return validation.isValid;
      },

      // ========== EDGE ACTIONS ==========

      addEdge: (sourceId: string, targetId: string) => {
        const { nodes, edges } = get();

        // Validate using canConnect
        const validation = validateConnection(sourceId, targetId, nodes, edges);

        if (!validation.isValid) {
          // Show toast instead of console.warn
          if (validation.reason) {
            const message = getToastMessage(validation.reason);
            toast.error(message.title, {
              // description shown as second line if supported
            });
          }
          return;
        }

        set((state) => {
          state.edges.push({
            id: `e-${sourceId}-${targetId}`,
            source: sourceId,
            target: targetId,
          });
        });

        get().runCycleDetection();
      },

      removeEdge: (edgeId: string) => {
        set((state) => {
          state.edges = state.edges.filter(e => e.id !== edgeId);
        });
        get().runCycleDetection();
      },

      // ========== REACTFLOW CALLBACKS ==========

      onNodesChange: (changes) => {
        set((state) => {
          state.nodes = applyNodeChanges(changes, state.nodes) as FlowNode[];
        });
      },

      onEdgesChange: (changes) => {
        set((state) => {
          state.edges = applyEdgeChanges(changes, state.edges) as FlowEdge[];
        });
        get().runCycleDetection();
      },

      onConnect: (connection) => {
        if (connection.source && connection.target) {
          get().addEdge(connection.source, connection.target);
        }
      },

      // ========== CYCLE DETECTION ==========

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

      // ========== SIMULATION (NEW) ==========

      simulateFlow: (): SimulationResult | null => {
        const { nodes, edges, hasCycle } = get();

        if (hasCycle) {
          toast.error('Cannot simulate: flow contains a cycle');
          return null;
        }

        if (nodes.length === 0) {
          toast(TOAST_MESSAGES.SIMULATION_NO_NODES.title, { icon: '⚠️' });
          return null;
        }

        const result = simulateFlow(nodes, edges);

        if (result) {
          toast.success(`Executed: ${result.pathString}`, { duration: 5000 });
        }

        return result;
      },

      // ========== RESET ==========

      resetFlow: () => {
        set({
          nodes: [],
          edges: [],
          hasCycle: false,
          cycleNodes: new Set<string>(),
          cycleEdges: new Set<string>(),
          selectedNodeId: null,
        });
        toast(TOAST_MESSAGES.FLOW_RESET.title, { icon: '🔄' });
      },
    }))
  )
);
```

---

## Component Breakdown (Production Ready)

### 1. App.tsx (Root)

```typescript
import { ReactFlowProvider } from '@xyflow/react';
import { Toaster } from 'react-hot-toast';
import { FlowCanvas } from './components/flow/FlowCanvas';
import { FlowToolbar } from './components/flow/FlowToolbar';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50">
      <ReactFlowProvider>
        <FlowToolbar />
        <ErrorBoundary>
          <FlowCanvas />
        </ErrorBoundary>
      </ReactFlowProvider>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '14px',
            padding: '12px 16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </div>
  );
}
```

### 2. FlowCanvas.tsx (Production Ready)

```typescript
import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Connection,
  MarkerType,
} from '@xyflow/react';
import toast from 'react-hot-toast';
import { useFlowStore } from '../../store';
import { CustomNode } from '../nodes/CustomNode';
import { EmptyState } from './EmptyState';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { getToastMessage } from '../../utils/toastMessages';
import { canConnect } from '../../utils/edgeHelpers';
import '@xyflow/react/dist/style.css';

const nodeTypes = {
  custom: CustomNode,
};

export function FlowCanvas() {
  useKeyboardShortcuts();

  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const cycleNodes = useFlowStore((state) => state.cycleNodes);
  const cycleEdges = useFlowStore((state) => state.cycleEdges);
  const highlightedNodes = useFlowStore((state) => state.highlightedNodes);
  const highlightedEdges = useFlowStore((state) => state.highlightedEdges);
  const onNodesChange = useFlowStore((state) => state.onNodesChange);
  const onEdgesChange = useFlowStore((state) => state.onEdgesChange);
  const onConnect = useFlowStore((state) => state.onConnect);
  const setSelectedNode = useFlowStore((state) => state.setSelectedNode);

  const isValidConnection = useCallback(
    (connection: Connection): boolean => {
      if (!connection.source || !connection.target) return false;

      const validation = canConnect(
        connection.source,
        connection.target,
        nodes,
        edges
      );

      if (!validation.isValid && validation.reason) {
        const message = getToastMessage(validation.reason);
        toast.error(message.title);
        return false;
      }

      return true;
    },
    [nodes, edges]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const styledNodes = useMemo(() =>
    nodes.map(node => {
      const isInCycle = cycleNodes.has(node.id);
      const isHighlighted = highlightedNodes.has(node.id);

      return {
        ...node,
        data: {
          ...node.data,
          isInCycle,
          isHighlighted,
        },
      };
    }),
    [nodes, cycleNodes, highlightedNodes]
  );

  const styledEdges = useMemo(() =>
    edges.map(edge => {
      const isInCycle = cycleEdges.has(edge.id);
      const isHighlighted = highlightedEdges.has(edge.id);

      let strokeColor = '#94a3b8';
      if (isInCycle) strokeColor = '#ef4444';
      else if (isHighlighted) strokeColor = '#10b981';

      return {
        ...edge,
        type: 'smoothstep',
        animated: isInCycle || isHighlighted,
        style: {
          stroke: strokeColor,
          strokeWidth: isHighlighted ? 3 : 2,
          transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: strokeColor,
        },
      };
    }),
    [edges, cycleEdges, highlightedEdges]
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
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
        className="bg-slate-50"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#cbd5e1"
        />
        <Controls
          className="bg-white rounded-lg shadow-lg border border-slate-200"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={(node) => {
            if (cycleNodes.has(node.id)) return '#ef4444';
            if (highlightedNodes.has(node.id)) return '#10b981';
            return '#64748b';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="bg-white rounded-lg shadow-lg border border-slate-200"
        />
      </ReactFlow>
    </div>
  );
}
```

### 3. FlowToolbar.tsx (Production Ready with Simulation)

```typescript
import { useFlowStore } from '../../store';

export function FlowToolbar() {
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const hasCycle = useFlowStore((state) => state.hasCycle);
  const isSimulating = useFlowStore((state) => state.isSimulating);
  const addNode = useFlowStore((state) => state.addNode);
  const resetFlow = useFlowStore((state) => state.resetFlow);
  const startSimulation = useFlowStore((state) => state.startSimulation);
  const stopSimulation = useFlowStore((state) => state.stopSimulation);

  const handleAddRoot = () => {
    addNode();
  };

  const handleSimulate = () => {
    if (isSimulating) {
      stopSimulation();
    } else {
      startSimulation();
    }
  };

  const handleReset = () => {
    if (nodes.length > 0) {
      resetFlow();
    }
  };

  const canSimulate = nodes.length > 0 && !hasCycle;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-slate-800">
          Logic Flow Mapper
        </h1>
        {nodes.length > 0 && (
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              {nodes.length} node{nodes.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
              {edges.length} connection{edges.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleAddRoot}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg
                     hover:bg-slate-200 active:bg-slate-300
                     transition-all duration-150 font-medium
                     shadow-sm hover:shadow"
        >
          + Add Root Node
        </button>

        <button
          onClick={handleSimulate}
          disabled={!canSimulate}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all duration-150
            shadow-sm hover:shadow
            ${!canSimulate
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              : isSimulating
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }
          `}
        >
          {isSimulating ? (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              Stop
            </span>
          ) : (
            'Simulate Logic'
          )}
        </button>

        {hasCycle && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Cycle Detected</span>
          </div>
        )}

        <div className="w-px h-6 bg-slate-200"></div>

        <button
          onClick={handleReset}
          disabled={nodes.length === 0}
          className={`
            px-4 py-2 rounded-lg transition-all duration-150
            ${nodes.length === 0
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
            }
          `}
        >
          Reset
        </button>
      </div>
    </header>
  );
}
```

### 4. CustomNode.tsx (Production Ready with Keyboard Support)

```typescript
import { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { useFlowStore } from '../../store';

interface NodeData {
  condition: string;
  isInCycle?: boolean;
  isHighlighted?: boolean;
}

interface CustomNodeProps extends NodeProps {
  data: NodeData;
}

export const CustomNode = memo(function CustomNode({ id, data, selected }: CustomNodeProps) {
  const updateNodeCondition = useFlowStore((state) => state.updateNodeCondition);
  const addNode = useFlowStore((state) => state.addNode);
  const deleteNode = useFlowStore((state) => state.deleteNode);

  const handleConditionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeCondition(id, e.target.value);
    },
    [id, updateNodeCondition]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addNode(id);
      }
    },
    [id, addNode]
  );

  const handleAddChild = useCallback(() => {
    addNode(id);
  }, [id, addNode]);

  const handleDelete = useCallback(() => {
    deleteNode(id);
  }, [id, deleteNode]);

  const getBorderColor = () => {
    if (data.isInCycle) return 'border-red-400 shadow-red-100';
    if (data.isHighlighted) return 'border-emerald-400 shadow-emerald-100';
    if (selected) return 'border-blue-400 shadow-blue-100';
    return 'border-slate-200 hover:border-slate-300';
  };

  const getHandleColor = () => {
    if (data.isInCycle) return 'bg-red-400';
    if (data.isHighlighted) return 'bg-emerald-400';
    return 'bg-slate-400 group-hover:bg-blue-400';
  };

  return (
    <div
      className={`
        group px-4 py-3 rounded-xl bg-white min-w-[220px]
        border-2 shadow-sm
        transition-all duration-200 ease-out
        hover:shadow-md
        ${getBorderColor()}
        ${data.isInCycle ? 'bg-red-50/50' : ''}
        ${data.isHighlighted ? 'bg-emerald-50/50' : ''}
      `}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={`
          !w-3 !h-3 !border-2 !border-white
          transition-colors duration-200
          ${getHandleColor()}
        `}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Condition
          </label>
          <span className="text-xs text-slate-400 font-mono">
            {id}
          </span>
        </div>

        <input
          type="text"
          value={data.condition}
          onChange={handleConditionChange}
          onKeyDown={handleKeyDown}
          placeholder="e.g., user.isLoggedIn"
          className={`
            w-full px-3 py-2 border rounded-lg text-sm
            placeholder:text-slate-300
            focus:outline-none focus:ring-2 focus:ring-offset-1
            transition-all duration-150
            ${data.isInCycle
              ? 'border-red-200 focus:ring-red-400 bg-white'
              : 'border-slate-200 focus:ring-blue-400 focus:border-blue-400'
            }
          `}
        />

        <div className="flex gap-2">
          <button
            onClick={handleAddChild}
            className="flex-1 px-3 py-1.5 text-sm font-medium
                       bg-slate-100 text-slate-700 rounded-lg
                       hover:bg-blue-500 hover:text-white
                       active:bg-blue-600
                       transition-all duration-150"
          >
            + Child
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1.5 text-sm font-medium
                       text-slate-400 rounded-lg
                       hover:bg-red-500 hover:text-white
                       active:bg-red-600
                       transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-slate-400 text-center">
          Press Enter to add child
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className={`
          !w-3 !h-3 !border-2 !border-white
          transition-colors duration-200
          ${data.isInCycle ? 'bg-red-400' : 'bg-blue-400 group-hover:bg-blue-500'}
        `}
      />
    </div>
  );
});
```

---

## Edge Case Handling (Production Ready)

| Edge Case | Detection | Handling | User Feedback |
|-----------|-----------|----------|---------------|
| **Self-loop (A → A)** | `sourceId === targetId` | Block in `isValidConnection` | Toast: "Self-loop not allowed" |
| **Duplicate edges** | Check existing edges | Block in `isValidConnection` | Toast: "Connection already exists" |
| **Would create cycle** | `pathExists(target, source)` | Block in `isValidConnection` | Toast: "Would create a loop" |
| **Delete node** | N/A | Remove node + all connected edges | Toast: "Node deleted" |
| **Delete via keyboard** | `Delete`/`Backspace` key | Delete selected node | Toast: "Node deleted" |
| **Link to non-existing node** | Validate node exists | Block in `isValidConnection` | Toast: "Invalid connection" |
| **Rapid updates** | N/A | Zustand batches updates | N/A |
| **Large graphs** | Monitor performance | O(V+E) algorithm, memoization | N/A |
| **Node overlap** | `preventOverlap()` | Auto-adjust position | N/A |
| **Empty canvas** | `nodes.length === 0` | Show EmptyState component | CTA button |
| **Empty simulation** | Check nodes.length | Block simulation | Toast: "No nodes to simulate" |
| **Component crash** | ErrorBoundary | Show fallback UI | Reload button |
| **Simulation while cycling** | Check hasCycle | Block and stop simulation | Toast error |

---

## UI/UX Design (Polished)

### Design Tokens

```typescript
// /constants/design.constants.ts
export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
  },
  success: {
    50: '#ecfdf5',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
  },
  danger: {
    50: '#fef2f2',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
  },
} as const;

export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
} as const;

export const TRANSITIONS = {
  fast: '150ms ease-out',
  normal: '200ms ease-out',
  slow: '300ms ease-out',
} as const;
```

### Global Styles (index.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    @apply bg-slate-50 text-slate-800;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
}

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-all duration-150;
    @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
  }

  .btn-primary {
    @apply bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700;
    @apply focus:ring-blue-500;
  }

  .btn-secondary {
    @apply bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300;
    @apply focus:ring-slate-500;
  }

  .btn-danger {
    @apply bg-red-500 text-white hover:bg-red-600 active:bg-red-700;
    @apply focus:ring-red-500;
  }
}

/* React Flow Customizations */
.react-flow__node {
  transition: transform 0.2s ease-out;
}

.react-flow__edge-path {
  transition: stroke 0.3s ease, stroke-width 0.3s ease;
}

.react-flow__controls {
  @apply shadow-lg rounded-lg overflow-hidden;
}

.react-flow__controls-button {
  @apply border-slate-200 hover:bg-slate-50 transition-colors;
}

.react-flow__minimap {
  @apply shadow-lg rounded-lg overflow-hidden;
}
```

### Consistent Spacing System

| Element | Spacing |
|---------|---------|
| Page padding | `px-6` |
| Card padding | `p-4` |
| Button padding | `px-4 py-2` |
| Input padding | `px-3 py-2` |
| Gap between elements | `gap-3` or `gap-4` |
| Section spacing | `space-y-6` |

### Hover & Active States

All interactive elements have:
- **Hover**: Subtle background/color change
- **Active**: Slightly darker than hover
- **Focus**: Ring with offset
- **Transition**: 150-200ms ease-out

```css
/* Example button states */
.interactive-element {
  @apply transition-all duration-150;
  @apply hover:bg-slate-100;
  @apply active:bg-slate-200;
  @apply focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}
```

### Shadow Consistency

| Component | Shadow |
|-----------|--------|
| Toolbar | `shadow-sm` |
| Node | `shadow-sm` → `shadow-md` on hover |
| Toast | `shadow-lg` |
| Modal | `shadow-xl` |
| Dropdown | `shadow-lg` |

---

## Performance Optimizations (Updated)

### 1. Optimized DFS (No Array Copies)

```typescript
// OLD: O(n) per recursive call
dfs(neighbor, [...path]);

// NEW: O(1) per recursive call
path.push(nodeId);
dfs(neighbor);
path.pop();
```

### 2. Memoized Styled Nodes/Edges

```typescript
const styledNodes = useMemo(() =>
  nodes.map(node => ({
    ...node,
    data: { ...node.data, isInCycle: cycleNodes.has(node.id) },
  })),
  [nodes, cycleNodes]  // Only recompute when these change
);
```

### 3. Pre-Connection Validation

```typescript
// Validate BEFORE adding edge = no cleanup needed
const isValidConnection = useCallback((connection) => {
  // Check happens here, not after edge creation
  return canConnect(source, target, nodes, edges).isValid;
}, [nodes, edges]);
```

### 4. Selective Zustand Subscriptions

```typescript
// Only subscribe to what you need
const hasCycle = useFlowStore((state) => state.hasCycle);
// Component only re-renders when hasCycle changes
```

---

## Implementation Phases (Production Ready)

### Phase 1: Project Setup (1 hour)

- [ ] Initialize Vite + React + TypeScript project
- [ ] Install dependencies (@xyflow/react, zustand, tailwindcss, react-hot-toast)
- [ ] Configure Tailwind CSS with custom theme
- [ ] Create folder structure
- [ ] Setup TypeScript strict mode
- [ ] Add Inter font

### Phase 2: Core Types & Constants (30 min)

- [ ] Define all TypeScript types
- [ ] Create positioning constants
- [ ] Create edge styling constants
- [ ] Create toast message constants
- [ ] Create design tokens

### Phase 3: Utility Functions (1.5 hours)

- [ ] Implement `detectCycle.ts` (OPTIMIZED with push/pop)
- [ ] Implement `graphHelpers.ts` (with pathExists)
- [ ] Implement `edgeHelpers.ts` (with canConnect)
- [ ] Implement `nodeHelpers.ts` (with positioning)
- [ ] Implement `simulation.ts` (with step-by-step highlighting)
- [ ] Implement `toastMessages.ts`

### Phase 4: Zustand Store (1 hour)

- [ ] Implement store with all actions
- [ ] Add canConnect validation
- [ ] Add simulation state (isSimulating, highlightedNodes, highlightedEdges)
- [ ] Add startSimulation/stopSimulation actions
- [ ] Create memoized selectors

### Phase 5: React Flow Integration (1.5 hours)

- [ ] Create FlowCanvas with isValidConnection
- [ ] Add arrow markers to edges
- [ ] Create CustomNode component with keyboard support
- [ ] Implement node selection tracking
- [ ] Add background grid
- [ ] Add minimap and controls
- [ ] Style edges with proper transitions

### Phase 6: UI Components (1.5 hours)

- [ ] Create FlowToolbar with simulation toggle
- [ ] Create EmptyState component
- [ ] Create ErrorBoundary component
- [ ] Setup toast container with custom styling
- [ ] Create useKeyboardShortcuts hook
- [ ] Style cycle warnings

### Phase 7: Polish & Testing (1 hour)

- [ ] Test all edge cases
- [ ] Verify keyboard shortcuts (Delete, Enter)
- [ ] Test simulation highlighting
- [ ] Test error boundary
- [ ] Performance testing with 50+ nodes
- [ ] Cross-browser testing
- [ ] UI polish (shadows, transitions, spacing)

### Phase 8: Documentation & Deploy (1 hour)

- [ ] Write README.md
- [ ] Add demo GIF/video
- [ ] Deploy to Vercel/Netlify
- [ ] Final testing on deployed version
- [ ] Clean commit history

---

## Testing Strategy (Updated)

### Unit Tests

```typescript
// detectCycle.test.ts
describe('detectCycle (Optimized)', () => {
  it('returns false for acyclic graph', () => { /* ... */ });
  it('detects simple cycle A → B → C → A', () => { /* ... */ });
  it('detects self-loop A → A', () => { /* ... */ });
});

// canConnect.test.ts
describe('canConnect', () => {
  it('returns false for self-loop', () => {
    const result = canConnect('A', 'A', nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('self-loop');
  });

  it('returns false when would create cycle', () => {
    // A → B → C exists
    const nodes = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
    const edges = [
      { id: 'e-A-B', source: 'A', target: 'B' },
      { id: 'e-B-C', source: 'B', target: 'C' },
    ];
    // Trying to connect C → A would create cycle
    const result = canConnect('C', 'A', nodes, edges);
    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('would-create-cycle');
  });

  it('returns true for valid connection', () => {
    const result = canConnect('A', 'D', nodes, edges);
    expect(result.isValid).toBe(true);
  });
});

// simulation.test.ts
describe('simulateFlow', () => {
  it('returns path string in correct format', () => {
    const result = simulateFlow(nodes, edges);
    expect(result?.pathString).toBe('A → B → C');
  });
});
```

---

## Summary of All Enhancements

| Feature | Before | After |
|---------|--------|-------|
| **Cycle Prevention** | Detect after creation | Block BEFORE creation |
| **DFS Performance** | `[...path]` copies | `push/pop` in place |
| **User Feedback** | `console.warn` | Toast notifications |
| **Node Positioning** | Fixed position | Auto-calculated + overlap prevention |
| **Simulation** | Alert only | Step-by-step path highlighting |
| **isValidConnection** | Not implemented | Integrated with React Flow |
| **Edge Visualization** | Plain lines | Arrow markers showing direction |
| **Keyboard Shortcuts** | None | Delete node, Enter to add child |
| **Empty State** | Blank canvas | Centered CTA with icon |
| **Error Handling** | None | Error boundary with fallback UI |
| **UI Polish** | Basic | Smooth transitions, shadows, spacing |
| **Node Selection** | Not tracked | Visual selection state |

---

## Deliverables Checklist

### GitHub Repository

- [ ] Clean commit history (meaningful commits)
- [ ] `.gitignore` properly configured
- [ ] No sensitive data committed
- [ ] Branch: `main` with all code

### README.md Contents

```markdown
# Logic Flow Mapper

A production-ready visual tool for creating nested "If-Then" logic conditions with real-time cycle **prevention**, path simulation, and polished UX.

![Logic Flow Mapper Demo](./demo.gif)

## Key Features

- **Proactive Cycle Prevention**: Blocks invalid connections before they're created
- **Smart Node Positioning**: Auto-calculates child positions, prevents overlap
- **Visual Path Simulation**: Step-by-step highlighting of execution path
- **Arrow Edge Markers**: Clear direction indicators on all connections
- **Keyboard Shortcuts**: Delete key removes nodes, Enter adds children
- **Empty State UX**: Welcoming onboarding when canvas is empty
- **Error Boundary**: Graceful error handling with recovery option
- **Real-time Validation**: Toast notifications for all user actions

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript 5 | Type Safety |
| @xyflow/react | Flow Visualization |
| Zustand | State Management |
| Tailwind CSS | Styling |
| react-hot-toast | Notifications |

## Architecture Decisions

### Why Normalized Data Structure?
I chose separate `nodes[]` and `edges[]` arrays instead of nested children because:
1. **O(1) Updates**: Modifying any node doesn't require tree traversal
2. **Cycle Detection**: Easy to build adjacency list for graph algorithms
3. **React Flow Native**: Direct compatibility with the library
4. **Pre-validation**: Simple `pathExists(target, source)` check before adding edges

### Why Pre-connection Validation?
Instead of detecting cycles after creation:
1. User drags connection from Source → Target
2. `isValidConnection` callback fires BEFORE edge creation
3. Check: Does path exist from Target to Source?
4. If yes → Block connection, show toast
5. Result: Cycles never exist in the graph

### Why Keep DFS for Highlighting?
Even though we prevent cycles, DFS is still used for:
1. Simulation traversal (finding execution path)
2. Highlighting visited nodes/edges step-by-step
3. Future: Could detect disconnected components

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Delete` / `Backspace` | Remove selected node |
| `Enter` (in input) | Add child node |

## Running Locally

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build for Production

\`\`\`bash
npm run build
npm run preview
\`\`\`

## Live Demo

[https://logic-flow-mapper.vercel.app](https://logic-flow-mapper.vercel.app)

---

Built with care for the Technical Assessment
```

### Live Demo

- [ ] Deploy to Vercel or Netlify
- [ ] Test all features on deployed version
- [ ] Verify toast notifications work
- [ ] Test simulation console output
- [ ] Share URL in README

---

## Production Readiness Checklist

### Code Quality
- [ ] No console.log statements (except simulation output)
- [ ] No unused imports/variables
- [ ] Consistent naming conventions
- [ ] TypeScript strict mode with no errors
- [ ] All props properly typed

### Performance
- [ ] React.memo on CustomNode
- [ ] useMemo for styled nodes/edges
- [ ] useCallback for all handlers
- [ ] No unnecessary re-renders
- [ ] Efficient cycle detection (O(V+E))

### UX Polish
- [ ] Smooth hover transitions (150-200ms)
- [ ] Consistent shadows across components
- [ ] Loading/empty states
- [ ] Error handling with fallback UI
- [ ] Keyboard accessibility

### Testing
- [ ] Self-loop blocked
- [ ] Duplicate edge blocked
- [ ] Cycle creation blocked
- [ ] Delete removes connected edges
- [ ] Simulation works correctly
- [ ] Keyboard shortcuts work
- [ ] Error boundary catches errors

---

*Document created for Technical Assessment: Logic Flow Mapper*
*Candidate: Yash Parmar*
*Version: 3.0 (Production Ready)*
