import type { FlowNode, FlowEdge } from '../types';
import { POSITIONING } from '../constants';

export function generateNodeId(nodes: FlowNode[]): string {
  const maxId = nodes.reduce((max, node) => {
    const numericId = parseInt(node.id.replace('node-', ''), 10);
    return isNaN(numericId) ? max : Math.max(max, numericId);
  }, 0);
  return `node-${maxId + 1}`;
}

export function getNodeLabel(node: FlowNode | undefined): string {
  const value = node?.data?.condition?.trim();
  if (value) return value;
  const number = node?.id?.replace('node-', '') ?? '';
  return `Node ${number} (empty)`;
}

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
      isHighlighted: false,
    },
    position,
  };
}

export function calculateChildPosition(
  nodes: FlowNode[],
  edges: FlowEdge[],
  parentId: string
): { x: number; y: number } {
  const parent = nodes.find((n) => n.id === parentId);
  if (!parent) {
    return { x: 0, y: POSITIONING.ROOT_Y };
  }

  const existingChildren = edges.filter((e) => e.source === parentId);
  const childIndex = existingChildren.length; // BEFORE adding the new edge
  const total = childIndex + 1;
  const offset = ((total - 1) * POSITIONING.GAP_X) / 2;

  return {
    x: parent.position.x - offset + childIndex * POSITIONING.GAP_X,
    y: parent.position.y + POSITIONING.GAP_Y,
  };
}

export function calculateRootPosition(
  nodes: FlowNode[],
  edges: FlowEdge[]
): { x: number; y: number } {
  // Count existing root nodes (nodes with no incoming edges)
  const hasIncoming = new Set(edges.map((e) => e.target));
  const rootCount = nodes.filter((n) => !hasIncoming.has(n.id)).length;

  return {
    x: rootCount * POSITIONING.ROOT_GAP_X,
    y: POSITIONING.ROOT_Y,
  };
}
