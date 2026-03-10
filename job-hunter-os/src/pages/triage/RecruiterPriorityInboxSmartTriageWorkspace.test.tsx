import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { RecruiterPriorityInboxSmartTriageWorkspace } from './RecruiterPriorityInboxSmartTriageWorkspace';

describe('RecruiterPriorityInboxSmartTriageWorkspace', () => {
  const data = [
    { id: '1', candidateName: 'A', role: 'Data Analyst', recruiter: 'R1', stage: 'offer' as const, slaHoursRemaining: -2, stageUrgency: 90, expectedConversionLift: 88, slaRisk: 92, owner: 'alice' },
    { id: '2', candidateName: 'B', role: 'Product Analyst', recruiter: 'R2', stage: 'screen' as const, slaHoursRemaining: 20, stageUrgency: 42, expectedConversionLift: 35, slaRisk: 40, owner: 'bob' },
  ];

  it('renders empty state', () => {
    render(<RecruiterPriorityInboxSmartTriageWorkspace data={[]} />);
    expect(screen.getByText('No candidates in recruiter priority inbox.')).toBeInTheDocument();
  });

  it('supports selecting and running bulk actions', () => {
    render(<RecruiterPriorityInboxSmartTriageWorkspace data={data} />);
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]);
    fireEvent.click(screen.getByRole('button', { name: 'Assign' }));
    expect(screen.getByText(/assign pending/i)).toBeInTheDocument();
  });
});
