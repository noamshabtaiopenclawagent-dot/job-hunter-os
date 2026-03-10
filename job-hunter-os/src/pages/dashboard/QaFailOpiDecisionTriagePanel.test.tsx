import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QaFailOpiDecisionTriagePanel } from './QaFailOpiDecisionTriagePanel';

describe('QaFailOpiDecisionTriagePanel', () => {
  it('shows pending then approved note', () => {
    render(<QaFailOpiDecisionTriagePanel taskId="t1" qaTaskId="q1" issueTitle="Issue" checksRequired={6} />);
    fireEvent.click(screen.getByText('Approve fix execution'));
    expect(screen.getByText(/approved remediation/)).toBeInTheDocument();
  });
});
