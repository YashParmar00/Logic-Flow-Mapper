import { useFlowStore } from '../../store';

export function SimulationModal() {
  const modal = useFlowStore((s) => s.simulationModal);
  const close = useFlowStore((s) => s.closeSimulationModal);

  if (!modal.open || !modal.content) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-[420px] max-w-[90vw] p-5 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-slate-900">Full Simulation Path</h3>
          <button
            onClick={close}
            className="text-slate-400 hover:text-slate-600 text-lg font-semibold"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="text-sm text-slate-700 leading-relaxed max-h-56 overflow-auto">
          {modal.content}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={close}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
