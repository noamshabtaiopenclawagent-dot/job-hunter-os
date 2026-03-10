import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { EvergreenImprovementCycleBoard } from './EvergreenImprovementCycleBoard';

describe('EvergreenImprovementCycleBoard', () => {
  const insights = [
    { id: 'i1', module: 'Dashboard', metric: 'Visibility', baseline: 50, current: 75, note: 'Improved' },
  ];
  const proposals = [
    { id: 'p1', title: 'Proposal 1', rationale: 'Rationale', approvalRequired: true, status: 'draft' as const },
    { id: 'p2', title: 'Proposal 2', rationale: 'Rationale', approvalRequired: true, status: 'draft' as const },
  ];

  it('renders KPI delta and proposals', () => {
    render(<EvergreenImprovementCycleBoard insights={insights} proposals={proposals} />);
    expect(screen.getByText(/Verification KPI delta/)).toBeInTheDocument();
    expect(screen.getByText('Proposal 1')).toBeInTheDocument();
    expect(screen.getByText('Proposal 2')).toBeInTheDocument();
  });

  it('requests approval for draft proposal', () => {
    render(<EvergreenImprovementCycleBoard insights={insights} proposals={proposals} />);
    fireEvent.click(screen.getAllByText('Request approval')[0]);
    expect(screen.getByText(/approval_requested/)).toBeInTheDocument();
  });
});
