import React, { useState } from 'react';
import { TelemetryProvider } from './providers/TelemetryProvider';
import { GlobalNavigationShell } from './components/GlobalNavigationShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CandidateSourcingVelocityRadar } from './pages/dashboard/CandidateSourcingVelocityRadar';

// Mock data for the sourcing radar until backend wiring is complete
const mockSourcingData = [
  { id: '1', role: 'Frontend Engineer', channel: 'linkedin' as const, velocityPerWeek: 12, costPerHire: 8500, qualityBaseline: 78, pipelineConversionRate: 4.2, timeToFillBaseline: 35, budgetAllocation: 15000 },
  { id: '2', role: 'Frontend Engineer', channel: 'referral' as const, velocityPerWeek: 3, costPerHire: 3000, qualityBaseline: 92, pipelineConversionRate: 15.5, timeToFillBaseline: 22, budgetAllocation: 5000 },
  { id: '3', role: 'Backend Engineer', channel: 'agency' as const, velocityPerWeek: 5, costPerHire: 22000, qualityBaseline: 85, pipelineConversionRate: 8.5, timeToFillBaseline: 28, budgetAllocation: 45000 },
];

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0' }}>Welcome to Job Hunter OS</h3>
              <p style={{ margin: 0, color: '#4b5563' }}>Select a module from the sidebar to view telemetry and operations.</p>
            </div>
            <CandidateSourcingVelocityRadar data={mockSourcingData} />
          </div>
        );
      case 'sla-anticipation':
        return <div>SLA Anticipation Module Integration Pending...</div>;
      case 'offer-stability':
        return <div>Offer Stability Module Integration Pending...</div>;
      case 'interview-reliability':
        return <div>Interview Reliability Module Integration Pending...</div>;
      default:
        return <div>View not found.</div>;
    }
  };

  return (
    <ErrorBoundary>
      <TelemetryProvider endpointUrl="/api/telemetry/stream" pollIntervalMs={15000}>
        <GlobalNavigationShell activeViewId={activeView} onNavigate={setActiveView}>
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </GlobalNavigationShell>
      </TelemetryProvider>
    </ErrorBoundary>
  );
};

export default App;
