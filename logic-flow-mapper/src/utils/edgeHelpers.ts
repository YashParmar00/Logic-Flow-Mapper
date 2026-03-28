import type { FlowNode, FlowEdge, ConnectionValidationResult } from '../types';
import { buildAdjacencyList, pathExists } from './graphHelpers';

/**
 * Validates if a connection can be made.
 * Checks: self-loop, node existence, duplicate, would-create-cycle
 */
export function canConnect(
  sourceId: string,
  targetId: string,
  nodes: FlowNode[],
  edges: FlowEdge[]
): ConnectionValidationResult {
  if (!sourceId || !targetId) {
    return { isValid: false, reason: 'invalid-node' };
  }

  if (sourceId === targetId) {
    return { isValid: false, reason: 'self-loop' };
  }

  const sourceExists = nodes.some((n) => n.id === sourceId);
  const targetExists = nodes.some((n) => n.id === targetId);
  if (!sourceExists || !targetExists) {
    return { isValid: false, reason: 'invalid-node' };
  }

  const edgeExists = edges.some(
    (e) => e.source === sourceId && e.target === targetId
  );
  if (edgeExists) {
    return { isValid: false, reason: 'duplicate' };
  }

  // Check reverse edge (immediate cycle)
  const reverseExists = edges.some(
    (e) => e.source === targetId && e.target === sourceId
  );
  if (reverseExists) {
    return { isValid: false, reason: 'would-create-cycle' };
  }

  // Check if path exists from target to source (would create cycle)
  const adjacencyList = buildAdjacencyList(edges);
  if (pathExists(targetId, sourceId, adjacencyList)) {
    return { isValid: false, reason: 'would-create-cycle' };
  }

  return { isValid: true };
}

