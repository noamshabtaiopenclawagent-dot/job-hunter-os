import React, { useState } from 'react';
import { TelemetryProvider } from './providers/TelemetryProvider';
import { GlobalNavigationShell } from './components/GlobalNavigationShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CandidateSourcingVelocityRadar } from './pages/dashboard/CandidateSourcingVelocityRadar';
import { RecruiterWorkloadHeatmap } from './pages/workload/RecruiterWorkloadHeatmap';
import { OfferStabilityTuner } from './pages/offer/OfferStabilityTuner';

// Extended mock data for the sourcing radar until backend wiring is complete
const mockSourcingData = [
  { id: '1', role: 'Frontend Engineer', channel: 'linkedin' as const, velocityPerWeek: 12, costPerHire: 8500, qualityBaseline: 78, pipelineConversionRate: 4.2, timeToFillBaseline: 35, budgetAllocation: 15000 },
  { id: '2', role: 'Frontend Engineer', channel: 'referral' as const, velocityPerWeek: 3, costPerHire: 3000, qualityBaseline: 92, pipelineConversionRate: 15.5, timeToFillBaseline: 22, budgetAllocation: 5000 },
  { id: '3', role: 'Backend Engineer', channel: 'agency' as const, velocityPerWeek: 5, costPerHire: 22000, qualityBaseline: 85, pipelineConversionRate: 8.5, timeToFillBaseline: 28, budgetAllocation: 45000 },
  { id: '4', role: 'Data Scientist', channel: 'outbound' as const, velocityPerWeek: 8, costPerHire: 6500, qualityBaseline: 82, pipelineConversionRate: 6.5, timeToFillBaseline: 40, budgetAllocation: 25000 },
];

const mockWorkloadData = [
  { id: '1', recruiter: 'Alice Smith', department: 'Engineering', complexity: 'high' as const, activeReqs: 12, candidatesInProcess: 85, workloadDensityScore: 92, burnoutRiskBaseline: 88, slaDegradationBaseline: 65, continuityFailureBaseline: 45 },
  { id: '2', recruiter: 'Bob Jones', department: 'Sales', complexity: 'medium' as const, activeReqs: 8, candidatesInProcess: 40, workloadDensityScore: 65, burnoutRiskBaseline: 45, slaDegradationBaseline: 20, continuityFailureBaseline: 15 },
  { id: '3', recruiter: 'Charlie Davis', department: 'Design', complexity: 'specialized' as const, activeReqs: 5, candidatesInProcess: 25, workloadDensityScore: 78, burnoutRiskBaseline: 60, slaDegradationBaseline: 35, continuityFailureBaseline: 25 },
  { id: '4', recruiter: 'Diana Prince', department: 'Engineering', complexity: 'low' as const, activeReqs: 22, candidatesInProcess: 150, workloadDensityScore: 85, burnoutRiskBaseline: 75, slaDegradationBaseline: 50, continuityFailureBaseline: 40 },
];

const mockOfferData = [
  { id: 'c1', name: 'Jane Doe', role: 'Staff Engineer', department: 'Engineering', compExpectationMin: 180000, compExpectationMax: 220000, compPushed: true, marketRatePercentile: 90, competingOffers: 2, timeInProcessDays: 32, interviewScoreAvg: 8.5, flightRiskFlags: ['Another offer expiring soon'] },
  { id: 'c2', name: 'John Smith', role: 'Product Manager', department: 'Product', compExpectationMin: 140000, compExpectationMax: 160000, compPushed: false, marketRatePercentile: 75, competingOffers: 0, timeInProcessDays: 45, interviewScoreAvg: 7.2, flightRiskFlags: ['Process fatigue'] },
];

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState('offer-stability');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0' }}>Welcome to Job Hunter OS</h3>
              <p style={{ margin: 0, color: '#4b5563' }}>Select a module from the sidebar to view live telemetry and perform what-if simulations.</p>
            </div>
          </div>
        );
      case 'sourcing-radar':
        return <CandidateSourcingVelocityRadar data={mockSourcingData} />;
      case 'workload-heatmap':
        return <RecruiterWorkloadHeatmap data={mockWorkloadData} />;
      case 'offer-stability':
        return <OfferStabilityTuner data={mockOfferData} />;
      case 'sla-anticipation':
        return <div>SLA Anticipation Module Integration Pending...</div>;
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

