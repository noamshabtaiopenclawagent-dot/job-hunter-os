import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { OfferDecisionCollaborationCanvasWithConsensusSignals } from './OfferDecisionCollaborationCanvasWithConsensusSignals';

describe('OfferDecisionCollaborationCanvasWithConsensusSignals', () => {
  const signals = [
    { id: 's1', participant: 'Recruiter', role: 'recruiter' as const, confidence: 70, stance: 'counter' as const, note: 'adjust equity', updatedAt: '2026-03-10T10:00:00Z' },
    { id: 's2', participant: 'Manager', role: 'hiring_manager' as const, confidence: 80, stance: 'approve' as const, note: 'critical hire', updatedAt: '2026-03-10T10:05:00Z' },
  ];
  const comments = [
    { id: 'c1', author: 'Recruiter', role: 'recruiter' as const, tag: 'counter' as const, text: 'Need small comp adjustment' },
  ];
  const blockers = [
    { id: 'b1', label: 'Finance approval', owner: 'Finance', severity: 'high' as const, resolved: false },
  ];

  it('renders empty state', () => {
    render(<OfferDecisionCollaborationCanvasWithConsensusSignals signals={[]} />);
    expect(screen.getByText('No offer decision signals available.')).toBeInTheDocument();
  });

  it('renders consensus and comments', () => {
    render(<OfferDecisionCollaborationCanvasWithConsensusSignals signals={signals} comments={comments} blockers={blockers} />);
    expect(screen.getByText(/Consensus/)).toBeInTheDocument();
    expect(screen.getByText('Threaded comments')).toBeInTheDocument();
  });

  it('allows drafting a new comment', () => {
    render(<OfferDecisionCollaborationCanvasWithConsensusSignals signals={signals} comments={comments} blockers={blockers} />);
    fireEvent.change(screen.getByLabelText('Decision comment input'), { target: { value: 'Ship it' } });
    fireEvent.click(screen.getByText('Post comment'));
    expect(screen.getByText(/Saving comment/)).toBeInTheDocument();
  });
});
