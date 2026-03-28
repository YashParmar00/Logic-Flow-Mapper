# Logic Flow Mapper

A visual tool for building nested "If-Then" conditional logic with real-time cycle detection and flow simulation.

Built as a technical assessment demonstrating React, TypeScript, graph algorithms, and state management.

## Features

- Drag-and-drop node creation with automatic positioning
- Visual edge connections between condition nodes
- Real-time cycle detection with visual highlighting
- Proactive cycle prevention (blocks invalid connections before creation)
- Flow simulation with step-by-step path visualization
- Keyboard shortcuts (Delete to remove, Enter to add child)
- Zoom controls and minimap navigation

## Tech Stack

- **React 19** with TypeScript
- **@xyflow/react** for flow visualization
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Vite** for development and build

## Architecture

```
UI Layer (React Components)
    ↓
State Management (Zustand Store)
    ↓
Business Logic (Pure Utility Functions)
```

The store acts as a single source of truth. Components read state via selectors and dispatch actions. All graph algorithms are pure functions that receive data and return results.

## Data Structure Decision

Used a **normalized graph structure** with separate `nodes[]` and `edges[]` arrays instead of a nested tree:

**Why this approach:**
- O(1) node/edge updates without tree traversal
- Easy adjacency list construction for graph algorithms
- Direct compatibility with React Flow's data model
- Simple cycle detection via DFS with recursion stack

A nested structure would require recursive updates and make cycle detection more complex.

## Cycle Detection

Uses **DFS with a recursion stack** to detect cycles in O(V + E) time:

1. Maintain a `visited` set for processed nodes
2. Maintain a `recursionStack` set for current DFS path
3. If we encounter a node already in the recursion stack, we've found a back edge (cycle)
4. Mark all nodes and edges in the cycle for visual highlighting

**Proactive Prevention:** Before creating any edge, we check if a path already exists from target to source using BFS (`pathExists`). If it does, adding the edge would create a cycle, so we block it and show an error toast.

## Key Design Decisions

1. **Pre-connection validation** - Invalid edges are blocked before creation, not detected and removed after
2. **Deterministic traversal** - Nodes are sorted before DFS to ensure consistent simulation order
3. **Stable React Flow config** - All config objects defined outside components to prevent re-renders
4. **Individual Zustand selectors** - Components subscribe only to the state they need

## Running Locally

```bash
cd logic-flow-mapper
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build

```bash
npm run build
npm run preview
```

## Live Demo

[https://logic-flow-mapper.vercel.app](https://logic-flow-mapper.vercel.app)

---

Built for technical assessment
