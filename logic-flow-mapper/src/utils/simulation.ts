import type { FlowNode, FlowEdge, SimulationResult } from '../types';
import { buildAdjacencyList, getRootNodes } from './graphHelpers';
import { getNodeLabel } from './nodeHelpers';

export interface SimulationStep {
  nodeId: string;
  edgeId?: string;
}

function sortIds(ids: string[]): string[] {
  return [...ids].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function getStartNodes(nodes: FlowNode[], edges: FlowEdge[]): FlowNode[] {
  const roots = getRootNodes(nodes, edges);
  const sortedRootIds = sortIds(roots.map((n) => n.id));
  const sortedRoots = sortedRootIds
    .map((id) => nodes.find((n) => n.id === id))
    .filter((n): n is FlowNode => !!n);

  if (sortedRoots.length > 0) return sortedRoots;

  const sortedAllIds = sortIds(nodes.map((n) => n.id));
  const first = nodes.find((n) => n.id === sortedAllIds[0]);
  return first ? [first] : [];
}

export function simulateFlow(
  nodes: FlowNode[],
  edges: FlowEdge[]
): SimulationResult | null {
  if (nodes.length === 0) return null;

  const adjacencyList = buildAdjacencyList(edges);
  const startNodes = getStartNodes(nodes, edges);
  const visitedNodes = new Set<string>();
  const path: string[] = [];

  function traverse(nodeId: string): void {
    if (visitedNodes.has(nodeId)) return;
    visitedNodes.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    path.push(getNodeLabel(node));

    const children = sortIds(adjacencyList.get(nodeId) || []);
    children.forEach(traverse);
  }

  startNodes.forEach((n) => traverse(n.id));

  const pathString = path.join(' → ');

  return { path, pathString, success: true };
}

export function collectSimulationSteps(
  nodes: FlowNode[],
  edges: FlowEdge[]
): SimulationStep[] {
  if (nodes.length === 0) return [];

  const adjacencyList = buildAdjacencyList(edges);
  const startNodes = getStartNodes(nodes, edges);
  const visitedNodes = new Set<string>();
  const visitedEdges = new Set<string>();
  const steps: SimulationStep[] = [];

  function collect(nodeId: string, incomingEdgeId?: string): void {
    if (incomingEdgeId) {
      if (!visitedEdges.has(incomingEdgeId)) {
        visitedEdges.add(incomingEdgeId);
        steps.push({ nodeId, edgeId: incomingEdgeId });
      }
    } else {
      steps.push({ nodeId });
    }

    if (visitedNodes.has(nodeId)) return;
    visitedNodes.add(nodeId);

    const children = sortIds(adjacencyList.get(nodeId) || []);
    for (const child of children) {
      collect(child, `e-${nodeId}-${child}`);
    }
  }

  startNodes.forEach((n) => collect(n.id));

  return steps;
}
