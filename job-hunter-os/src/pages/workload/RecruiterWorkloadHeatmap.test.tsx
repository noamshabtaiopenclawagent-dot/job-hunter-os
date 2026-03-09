import React from 'react';
import { render, screen } from '@testing-library/react';
import { RecruiterWorkloadHeatmap } from './RecruiterWorkloadHeatmap';

describe('RecruiterWorkloadHeatmap', () => {
  it('renders loading state', () => {
    render(<RecruiterWorkloadHeatmap loading={true} />);
    expect(screen.getByText('Loading workload telemetry…')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<RecruiterWorkloadHeatmap error="Failed to fetch workload" onRetry={() => {}} />);
    expect(screen.getByText('Failed to fetch workload')).toBeInTheDocument();
  });

  it('renders data rows and scenarios when data is provided', () => {
    const mockData = [
      { 
        id: '1', 
        recruiter: 'Alice Smith', 
        department: 'Engineering', 
        complexity: 'high' as const, 
        activeReqs: 12, 
        candidatesInProcess: 85, 
        workloadDensityScore: 92, 
        burnoutRiskBaseline: 88, 
        slaDegradationBaseline: 65, 
        continuityFailureBaseline: 45 
      }
    ];
    render(<RecruiterWorkloadHeatmap data={mockData} />);
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Engineering · High')).toBeInTheDocument();
    expect(screen.getByText('Conservative Shedding')).toBeInTheDocument();
  });
});
