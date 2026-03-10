import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QaFailOpiDecisionTriagePanel } from './QaFailOpiDecisionTriagePanel';

describe('QaFailOpiDecisionTriagePanel', () => {
  it('shows pending then approved note', () => {
    render(<QaFailOpiDecisionTriagePanel taskId="t1" qaTaskId="q1" issueTitle="Issue" checksRequired={6} risk="medium" />);
    fireEvent.click(screen.getByText('Approve fix execution'));
    expect(screen.getByText(/approved remediation/)).toBeInTheDocument();
    expect(screen.getByText(/Risk:/)).toBeInTheDocument();
  });

  it('renders required check mapping table', () => {
    render(<QaFailOpiDecisionTriagePanel taskId="t1" qaTaskId="q1" issueTitle="Issue" checksRequired={8} checks={[{ id: 'C1', behavior: 'Status chips', expectedEvidence: 'DOM assertion', kpi: 'state visibility' }]} />);
    expect(screen.getByText(/Required 8-check evidence map/)).toBeInTheDocument();
    expect(screen.getByText(/C1/)).toBeInTheDocument();
    expect(screen.getByText(/KPI: state visibility/)).toBeInTheDocument();
  });
});
