import React from 'react';
import { render, screen } from '@testing-library/react';
import { OfferStabilityTuner } from './OfferStabilityTuner';

describe('OfferStabilityTuner', () => {
  it('renders loading state', () => {
    render(<OfferStabilityTuner loading={true} />);
    expect(screen.getByText('Loading candidate data…')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<OfferStabilityTuner data={[]} />);
    expect(screen.getByText('No active offers pending.')).toBeInTheDocument();
  });

  it('renders candidate and simulation scenarios', () => {
    const mockData = [{
      id: 'c1',
      name: 'Jane Doe',
      role: 'Staff Engineer',
      department: 'Engineering',
      compExpectationMin: 180000,
      compExpectationMax: 220000,
      compPushed: true,
      marketRatePercentile: 90,
      competingOffers: 2,
      timeInProcessDays: 32,
      interviewScoreAvg: 8.5,
      flightRiskFlags: ['Another offer expiring soon']
    }];
    
    render(<OfferStabilityTuner data={mockData} />);
    
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText(/Offer Stability Simulation: Jane Doe/)).toBeInTheDocument();
    expect(screen.getByText('Scenario A: Standard Package')).toBeInTheDocument();
    expect(screen.getByText('Scenario B: Aggressive Closing')).toBeInTheDocument();
  });
});
