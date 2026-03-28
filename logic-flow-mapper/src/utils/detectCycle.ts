import type { FlowNode, AdjacencyList, CycleDetectionResult } from '../types';

export function detectCycle(
  nodes: FlowNode[],
  adjacencyList: AdjacencyList
): CycleDetectionResult {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycleNodes = new Set<string>();
  const cycleEdges = new Set<string>();
  let hasCycle = false;

  const path: string[] = [];

  function dfs(nodeId: string): void {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];

    for (const neighbor of neighbors) {
      if (neighbor === nodeId) {
        hasCycle = true;
        cycleNodes.add(nodeId);
        cycleEdges.add(`e-${nodeId}-${neighbor}`);
        continue;
      }

      if (recursionStack.has(neighbor)) {
        hasCycle = true;
        markCycle(neighbor);
        continue;
      }

      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }

    recursionStack.delete(nodeId);
    path.pop();
  }

  function markCycle(cycleStart: string): void {
    const startIdx = path.indexOf(cycleStart);
    if (startIdx === -1) return;

    for (let i = startIdx; i < path.length; i++) {
      cycleNodes.add(path[i]);
      if (i < path.length - 1) {
        cycleEdges.add(`e-${path[i]}-${path[i + 1]}`);
      }
    }
    cycleEdges.add(`e-${path[path.length - 1]}-${cycleStart}`);
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id);
    }
  }

  return { hasCycle, cycleNodes, cycleEdges };
}
