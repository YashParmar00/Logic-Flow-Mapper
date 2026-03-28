import type { FlowNode, FlowEdge, AdjacencyList } from '../types';

export function buildAdjacencyList(edges: FlowEdge[]): AdjacencyList {
  const list: AdjacencyList = new Map();

  for (const edge of edges) {
    if (!list.has(edge.source)) {
      list.set(edge.source, []);
    }
    list.get(edge.source)!.push(edge.target);
  }

  return list;
}

/**
 * BFS to check if path exists from source to target.
 * Used for proactive cycle prevention.
 */
export function pathExists(
  sourceId: string,
  targetId: string,
  adjacencyList: AdjacencyList
): boolean {
  if (sourceId === targetId) return true;

  const visited = new Set<string>();
  const queue = [sourceId];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current === targetId) return true;
    if (visited.has(current)) continue;

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

export function getRootNodes(nodes: FlowNode[], edges: FlowEdge[]): FlowNode[] {
  const hasIncoming = new Set(edges.map((e) => e.target));
  return nodes.filter((n) => !hasIncoming.has(n.id));
}
