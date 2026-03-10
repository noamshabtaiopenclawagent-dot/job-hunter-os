import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { DashboardActionabilityUpgradeDecisionActions } from './DashboardActionabilityUpgradeDecisionActions';

describe('DashboardActionabilityUpgradeDecisionActions', () => {
  const actions = [
    { id: 'a1', title: 'Action 1', owner: 'Ops', module: 'Journey', etaHours: 4, expectedImpact: 'Lift conversion', priority: 'high' as const, kpiDelta: 5, status: 'open' as const },
  ];

  it('renders empty state', () => {
    render(<DashboardActionabilityUpgradeDecisionActions actions={[]} />);
    expect(screen.getByText('No decision actions found.')).toBeInTheDocument();
  });

  it('renders projected KPI lift', () => {
    render(<DashboardActionabilityUpgradeDecisionActions actions={actions} />);
    expect(screen.getByText(/Projected KPI lift/)).toBeInTheDocument();
  });

  it('starts an action', () => {
    render(<DashboardActionabilityUpgradeDecisionActions actions={actions} />);
    fireEvent.click(screen.getByText('Start'));
    expect(screen.getByText(/started/i)).toBeInTheDocument();
  });
});
