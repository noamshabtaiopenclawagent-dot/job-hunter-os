import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QaFailOpiDecisionTriagePanel } from './QaFailOpiDecisionTriagePanel';

describe('QaFailOpiDecisionTriagePanel', () => {
  it('shows pending then approved note', () => {
    render(<QaFailOpiDecisionTriagePanel taskId="t1" qaTaskId="q1" issueTitle="Issue" checksRequired={6} />);
    fireEvent.click(screen.getByText('Approve fix execution'));
    expect(screen.getByText(/approved remediation/)).toBeInTheDocument();
  });

  it('renders required check mapping table', () => {
    render(<QaFailOpiDecisionTriagePanel taskId="t1" qaTaskId="q1" issueTitle="Issue" checksRequired={6} checks={[{ id: 'C1', behavior: 'Status chips', expectedEvidence: 'DOM assertion' }]} />);
    expect(screen.getByText(/Required 6-check evidence map/)).toBeInTheDocument();
    expect(screen.getByText(/C1/)).toBeInTheDocument();
  });
});
