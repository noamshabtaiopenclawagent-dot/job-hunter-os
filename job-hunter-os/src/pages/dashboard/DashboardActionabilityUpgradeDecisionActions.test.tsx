import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { DashboardActionabilityUpgradeDecisionActions } from './DashboardActionabilityUpgradeDecisionActions';

afterEach(cleanup);

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
    expect(screen.getByText(/started/i)).toBeTruthy();
  });

  it('renders QaFailOpiDecisionTriagePanel when hasQaFail is true and hides component until resolved', () => {
    render(<DashboardActionabilityUpgradeDecisionActions actions={actions} hasQaFail={true} />);
    expect(screen.getByText(/Execution Blocked by QA Failure/i)).toBeTruthy();
    expect(screen.getByText(/QA FAIL Triage \(OPI Decision Required\)/i)).toBeTruthy();
    
    // Attempt approval
    fireEvent.click(screen.getByText('Approve fix execution'));
    expect(screen.queryByText(/Execution Blocked by QA Failure/i)).toBeNull();
  });
});
