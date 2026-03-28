import type { ToastMessage } from '../types';

type ValidationReason = 'self-loop' | 'duplicate' | 'would-create-cycle' | 'invalid-node';

export function getToastMessage(reason: ValidationReason): ToastMessage {
  switch (reason) {
    case 'self-loop':
      return { type: 'error', title: 'Self-loop not allowed' };
    case 'duplicate':
      return { type: 'warning', title: 'Connection already exists' };
    case 'would-create-cycle':
      return { type: 'error', title: 'Would create a cycle' };
    case 'invalid-node':
      return { type: 'error', title: 'Invalid connection' };
    default:
      return { type: 'error', title: 'Connection failed' };
  }
}

export const TOAST_MESSAGES = {
  NODE_CREATED: { type: 'success' as const, title: 'Node created' },
  NODE_DELETED: { type: 'success' as const, title: 'Node deleted' },
  EDGE_DELETED: { type: 'success' as const, title: 'Edge deleted' },
  SIMULATION_NO_NODES: { type: 'warning' as const, title: 'No nodes to simulate' },
  FLOW_RESET: { type: 'info' as const, title: 'Flow reset' },
};
