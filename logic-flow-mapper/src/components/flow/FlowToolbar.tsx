import { useFlowStore } from '../../store';

export function FlowToolbar() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const hasCycle = useFlowStore((s) => s.hasCycle);
  const isSimulating = useFlowStore((s) => s.isSimulating);
  const addNode = useFlowStore((s) => s.addNode);
  const resetFlow = useFlowStore((s) => s.resetFlow);
  const startSimulation = useFlowStore((s) => s.startSimulation);
  const undo = useFlowStore((s) => s.undo);
  const redo = useFlowStore((s) => s.redo);
  const pastLength = useFlowStore((s) => s.past.length);
  const futureLength = useFlowStore((s) => s.future.length);

  const canSimulate = nodes.length > 0 && !hasCycle;

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <svg
              className="w-4.5 h-4.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h7v7h-7z" />
            </svg>
          </div>
          <span className="text-base font-semibold text-slate-800">Logic Flow Mapper</span>
        </div>

        {nodes.length > 0 && (
          <div className="flex items-center gap-2.5 px-3 py-1 bg-slate-50 rounded-md text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              {nodes.length} node{nodes.length !== 1 ? 's' : ''}
            </span>
            <span className="text-slate-200">|</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
              {edges.length} edge{edges.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={() => pastLength > 0 && undo()}
          disabled={pastLength === 0}
          className={`px-3 py-2 text-sm font-medium border rounded-lg ${
            pastLength === 0
              ? 'cursor-not-allowed text-slate-400 border-slate-200 bg-white'
              : 'text-slate-700 border-slate-200 bg-white hover:bg-slate-50'
          }`}
          title="Undo (Ctrl/Cmd+Z)"
        >
          ↺ Undo
        </button>

        <button
          onClick={() => futureLength > 0 && redo()}
          disabled={futureLength === 0}
          className={`px-3 py-2 text-sm font-medium border rounded-lg ${
            futureLength === 0
              ? 'cursor-not-allowed text-slate-400 border-slate-200 bg-white'
              : 'text-slate-700 border-slate-200 bg-white hover:bg-slate-50'
          }`}
          title="Redo (Ctrl/Cmd+Shift+Z)"
        >
          ↻ Redo
        </button>

        <button
          onClick={() => addNode()}
          className="px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          + Add Node
        </button>

        <button
          onClick={() => startSimulation()}
          disabled={!canSimulate}
          className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-1 ${
            !canSimulate
              ? 'cursor-not-allowed text-slate-400 bg-slate-100'
              : isSimulating
              ? 'text-white bg-amber-500 hover:bg-amber-600'
              : 'text-white bg-emerald-500 hover:bg-emerald-600'
          }`}
        >
          {isSimulating ? (
            <>
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Stop
            </>
          ) : (
            'Simulate'
          )}
        </button>

        {hasCycle && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-200">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Cycle
          </div>
        )}

        <div className="w-px h-6 bg-slate-200" />

        <button
          onClick={() => nodes.length > 0 && resetFlow()}
          disabled={nodes.length === 0}
          className={`px-3 py-2 text-sm font-medium rounded-lg ${
            nodes.length === 0
              ? 'cursor-not-allowed text-slate-300'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Reset
        </button>
      </div>
    </header>
  );
}
