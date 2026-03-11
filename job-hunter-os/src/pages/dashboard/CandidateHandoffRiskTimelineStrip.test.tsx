import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CandidateHandoffRiskTimelineStrip } from './CandidateHandoffRiskTimelineStrip';

describe('CandidateHandoffRiskTimelineStrip', () => {
  afterEach(() => cleanup());

  it('C1 renders risk timeline events', () => {
    render(<CandidateHandoffRiskTimelineStrip />);
    expect(screen.getByTitle('Noa Levi 09:10 medium')).toBeInTheDocument();
    expect(screen.getByTitle('Idan Bar 13:20 low')).toBeInTheDocument();
  });

  it('C2 applies risk severity colors', () => {
    render(<CandidateHandoffRiskTimelineStrip />);
    expect(screen.getByTitle('Noa Levi 11:30 high')).toHaveStyle({ background: 'rgb(254, 202, 202)' });
  });

  it('C3 candidate filter narrows strip', () => {
    render(<CandidateHandoffRiskTimelineStrip />);
    fireEvent.change(screen.getByLabelText('Handoff Risk Candidate Filter'), { target: { value: 'Idan Bar' } });
    expect(screen.getByTitle('Idan Bar 13:20 low')).toBeInTheDocument();
    expect(screen.queryByTitle('Noa Levi 09:10 medium')).not.toBeInTheDocument();
  });

  it('C4 hover title includes timeline context', () => {
    render(<CandidateHandoffRiskTimelineStrip />);
    expect(screen.getByTitle('Noa Levi 11:30 high')).toBeInTheDocument();
  });

  it('C5 click opens risk detail', () => {
    render(<CandidateHandoffRiskTimelineStrip />);
    fireEvent.click(screen.getByTitle('Noa Levi 11:30 high'));
    expect(screen.getByText('Opened risk detail: r2')).toBeInTheDocument();
  });

  it('C6 handles loading state', () => {
    render(<CandidateHandoffRiskTimelineStrip loading />);
    expect(screen.getByText('Loading handoff risk timeline...')).toBeInTheDocument();
  });

  it('C7 handles empty state', () => {
    render(<CandidateHandoffRiskTimelineStrip data={[]} />);
    expect(screen.getByText('No handoff risks recorded.')).toBeInTheDocument();
  });

  it('C8 handles error state', () => {
    render(<CandidateHandoffRiskTimelineStrip error="Risk feed unavailable" />);
    expect(screen.getByText('Risk feed unavailable')).toBeInTheDocument();
  });
});
