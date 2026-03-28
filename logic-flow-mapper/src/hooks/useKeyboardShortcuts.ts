import { useEffect, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useFlowStore } from '../store';

export function useKeyboardShortcuts() {
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const deleteNode = useFlowStore((state) => state.deleteNode);
  const undo = useFlowStore((state) => state.undo);
  const redo = useFlowStore((state) => state.redo);
  const reactFlowInstance = useReactFlow();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isTyping) return;

      const isMeta = event.metaKey || event.ctrlKey;
      if (isMeta && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        event.stopPropagation();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNodeId) {
          event.preventDefault();
          event.stopPropagation();
          deleteNode(selectedNodeId);
          return;
        }

        const selectedNodes = reactFlowInstance.getNodes().filter((n) => n.selected);
        if (selectedNodes.length === 1) {
          event.preventDefault();
          event.stopPropagation();
          deleteNode(selectedNodes[0].id);
        }
      }
    },
    [selectedNodeId, deleteNode, undo, redo, reactFlowInstance]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [handleKeyDown]);
}
