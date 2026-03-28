import { useFlowStore } from '../../store';

export function EmptyState() {
  const addNode = useFlowStore((state) => state.addNode);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="text-center pointer-events-auto p-10 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/80">
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <svg
            className="w-9 h-9 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-slate-800 mb-2">Build Your Logic Flow</h3>
        <p className="text-base text-slate-500 mb-6 max-w-xs leading-relaxed">
          Create conditional logic trees with visual connections. Start by adding your first node.
        </p>
        <button
          onClick={() => addNode()}
          className="px-7 py-3.5 text-base font-semibold text-white rounded-xl bg-linear-to-r from-blue-500 to-blue-600 shadow-md shadow-blue-500/30 hover:-translate-y-0.5 transition-transform"
        >
          + Create First Node
        </button>
        <div className="mt-5 flex items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-[11px]">Enter</kbd>
            Add child
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-[11px]">Delete</kbd>
            Remove node
          </span>
        </div>
      </div>
    </div>
  );
}
