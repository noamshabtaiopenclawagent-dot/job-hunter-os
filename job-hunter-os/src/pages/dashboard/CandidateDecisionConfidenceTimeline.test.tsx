import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CandidateDecisionConfidenceTimeline } from './CandidateDecisionConfidenceTimeline';

describe('CandidateDecisionConfidenceTimeline', () => {
  afterEach(() => cleanup());

  it('C1 renders timeline entries', () => {
    render(<CandidateDecisionConfidenceTimeline />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('2026-03-10 09:15')).toBeInTheDocument();
    expect(screen.getByText('2026-03-11 11:20')).toBeInTheDocument();
  });

  it('C2 shows confidence percentages', () => {
    render(<CandidateDecisionConfidenceTimeline />);
    expect(screen.getByText('62%')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('C3 shows timestamps', () => {
    render(<CandidateDecisionConfidenceTimeline />);
    expect(screen.getByText('2026-03-10 09:15')).toBeInTheDocument();
  });

  it('C4 includes rationale titles', () => {
    render(<CandidateDecisionConfidenceTimeline />);
    expect(screen.getByTitle('Panel alignment improved confidence')).toBeInTheDocument();
  });

  it('C5 candidate filter narrows timeline', () => {
    render(<CandidateDecisionConfidenceTimeline />);
    fireEvent.change(screen.getByLabelText('Candidate Filter'), { target: { value: 'Idan Bar' } });
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('2026-03-11 11:20')).toBeInTheDocument();
    expect(screen.queryByText('2026-03-10 09:15')).not.toBeInTheDocument();
  });

  it('C6 handles loading state', () => {
    render(<CandidateDecisionConfidenceTimeline loading />);
    expect(screen.getByText('Loading decision confidence timeline...')).toBeInTheDocument();
  });

  it('C7 handles empty state', () => {
    render(<CandidateDecisionConfidenceTimeline data={[]} />);
    expect(screen.getByText('No decision confidence events found.')).toBeInTheDocument();
  });

  it('C8 handles error state', () => {
    render(<CandidateDecisionConfidenceTimeline error="Timeline unavailable" />);
    expect(screen.getByText('Timeline unavailable')).toBeInTheDocument();
  });
});
