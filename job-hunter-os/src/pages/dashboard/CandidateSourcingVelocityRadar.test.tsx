import React from 'react';
import { render, screen } from '@testing-library/react';
import { CandidateSourcingVelocityRadar } from './CandidateSourcingVelocityRadar';

describe('CandidateSourcingVelocityRadar', () => {
  it('renders loading state', () => {
    render(<CandidateSourcingVelocityRadar loading={true} />);
    expect(screen.getByText('Loading sourcing telemetry…')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<CandidateSourcingVelocityRadar error="Connection failed" onRetry={() => {}} />);
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });

  it('renders data rows and scenarios when data is provided', () => {
    const mockData = [
      { id: '1', role: 'Engineer', channel: 'linkedin' as const, velocityPerWeek: 10, costPerHire: 5000, qualityBaseline: 80, pipelineConversionRate: 5, timeToFillBaseline: 30, budgetAllocation: 10000 }
    ];
    render(<CandidateSourcingVelocityRadar data={mockData} />);
    expect(screen.getByText('Engineer')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Conservative Shift')).toBeInTheDocument();
  });
});
