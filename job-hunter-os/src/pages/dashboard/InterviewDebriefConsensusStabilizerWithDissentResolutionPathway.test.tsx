import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InterviewDebriefConsensusStabilizerWithDissentResolutionPathway } from './InterviewDebriefConsensusStabilizerWithDissentResolutionPathway';

describe('InterviewDebriefConsensusStabilizerWithDissentResolutionPathway', () => {
  it('renders baseline and fallback states', () => {
    const { rerender } = render(<InterviewDebriefConsensusStabilizerWithDissentResolutionPathway />);
    expect(screen.getByText(/Noa Levi/)).toBeInTheDocument();
    expect(screen.getByText('Consensus: 65%')).toBeInTheDocument();
    expect(screen.getByText('Alex')).toBeInTheDocument();
    expect(screen.getByText('Resolution plan: Follow-up code review async')).toBeInTheDocument();
    expect(screen.getByTitle('Concerns about state management depth')).toBeInTheDocument();

    rerender(<InterviewDebriefConsensusStabilizerWithDissentResolutionPathway loading />);
    expect(screen.getByText('Loading debrief consensus stabilizer...')).toBeInTheDocument();

    rerender(<InterviewDebriefConsensusStabilizerWithDissentResolutionPathway error="Consensus feed unavailable" />);
    expect(screen.getByText('Consensus feed unavailable')).toBeInTheDocument();

    rerender(<InterviewDebriefConsensusStabilizerWithDissentResolutionPathway data={[]} />);
    expect(screen.getByText('No debrief items available.')).toBeInTheDocument();
  });
});
