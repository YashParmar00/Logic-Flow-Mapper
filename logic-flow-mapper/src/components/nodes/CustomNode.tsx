import { memo, useCallback, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import { useFlowStore } from '../../store';

interface NodeData extends Record<string, unknown> {
  condition: string;
  isInCycle?: boolean;
  isHighlighted?: boolean;
}

type CustomNodeType = Node<NodeData, 'custom'>;

function CustomNodeComponent({ id, data, selected }: NodeProps<CustomNodeType>) {
  const updateNodeCondition = useFlowStore((state) => state.updateNodeCondition);
  const addNode = useFlowStore((state) => state.addNode);
  const deleteNode = useFlowStore((state) => state.deleteNode);
  const [isHovered, setIsHovered] = useState(false);

  const nodeData = data as NodeData;

  const handleConditionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeCondition(id, e.target.value);
    },
    [id, updateNodeCondition]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
        e.preventDefault();
        e.stopPropagation();
        addNode(id);
      }
    },
    [id, addNode]
  );

  const handleAddChild = useCallback(() => {
    addNode(id);
  }, [id, addNode]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  }, [id, deleteNode]);

  const baseContainerClasses =
    'min-w-[240px] rounded-2xl px-5 py-4 transition-all duration-200 bg-white border shadow-sm';

  const getContainerClass = () => {
    if (nodeData.isInCycle)
      return `${baseContainerClasses} border-red-400 bg-gradient-to-br from-red-50 to-white shadow-[0_4px_20px_rgba(239,68,68,0.15)] ring-4 ring-red-100/60`;
    if (nodeData.isHighlighted)
      return `${baseContainerClasses} border-emerald-400 bg-gradient-to-br from-emerald-50 to-white shadow-[0_4px_20px_rgba(16,185,129,0.2)] ring-4 ring-emerald-100/60`;
    if (selected)
      return `${baseContainerClasses} border-blue-400 bg-gradient-to-br from-blue-50 to-white shadow-[0_4px_20px_rgba(59,130,246,0.15)] ring-4 ring-blue-100/60`;
    return `${baseContainerClasses} border-slate-200 ${
      isHovered ? 'shadow-xl' : 'shadow-sm'
    }`;
  };

  const getHandleColor = () => {
    if (nodeData.isInCycle) return '#f87171';
    if (nodeData.isHighlighted) return '#34d399';
    return '#60a5fa';
  };

  return (
    <div
      className={getContainerClass()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: getHandleColor(),
          width: 14,
          height: 14,
          border: '3px solid white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          transition: 'transform 0.15s ease',
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
        }}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: nodeData.isInCycle
                  ? '#ef4444'
                  : nodeData.isHighlighted
                  ? '#10b981'
                  : '#3b82f6',
              }}
            />
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.05em]">
              Condition
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
            {id}
          </span>
        </div>

        <input
          type="text"
          value={nodeData.condition || ''}
          onChange={handleConditionChange}
          onKeyDown={handleKeyDown}
          placeholder="e.g., user.isLoggedIn"
          className={`w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-lg outline-none transition focus:ring-2 ${
            nodeData.isInCycle
              ? 'border border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border border-slate-200 focus:border-blue-400 focus:ring-blue-100'
          }`}
        />

        <div className="flex gap-2">
          <button
            onClick={handleAddChild}
            className="flex-1 px-3.5 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
          >
            + Add Child
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-2 text-slate-400 bg-slate-50 border border-slate-200 rounded-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors flex items-center justify-center"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 text-center m-0">
          Press Enter to add child node
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 14,
          height: 14,
          background: nodeData.isInCycle ? '#f87171' : '#3b82f6',
          border: '3px solid white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          transition: 'transform 0.15s ease',
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
        }}
      />
    </div>
  );
}

export const CustomNode = memo(CustomNodeComponent);
