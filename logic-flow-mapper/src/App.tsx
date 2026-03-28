import { ReactFlowProvider } from '@xyflow/react';
import { Toaster } from 'react-hot-toast';

import { FlowCanvas, FlowToolbar } from './components/flow';
import { ErrorBoundary, SimulationModal } from './components/ui';

function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50">
      <ReactFlowProvider>
        <FlowToolbar />
        <ErrorBoundary>
          <FlowCanvas />
        </ErrorBoundary>
      </ReactFlowProvider>

      <SimulationModal />

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '14px',
            padding: '12px 16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </div>
  );
}

export default App;
