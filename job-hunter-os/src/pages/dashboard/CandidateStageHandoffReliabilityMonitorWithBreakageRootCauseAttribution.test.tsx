import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CandidateStageHandoffReliabilityMonitorWithBreakageRootCauseAttribution } from './CandidateStageHandoffReliabilityMonitorWithBreakageRootCauseAttribution';

describe('CandidateStageHandoffReliabilityMonitorWithBreakageRootCauseAttribution', () => {
  it('renders baseline plus loading/error/empty fallback states', () => {
    const { rerender } = render(<CandidateStageHandoffReliabilityMonitorWithBreakageRootCauseAttribution />);
    expect(screen.getByText('Screen -> Interview')).toBeInTheDocument();
    expect(screen.getByText('Reliability: 92%')).toBeInTheDocument();

    rerender(<CandidateStageHandoffReliabilityMonitorWithBreakageRootCauseAttribution loading />);
    expect(screen.getByText('Loading handoff reliability monitor...')).toBeInTheDocument();

    rerender(<CandidateStageHandoffReliabilityMonitorWithBreakageRootCauseAttribution error="Handoff feed unavailable" />);
    expect(screen.getByText('Handoff feed unavailable')).toBeInTheDocument();

    rerender(<CandidateStageHandoffReliabilityMonitorWithBreakageRootCauseAttribution data={[]} />);
    expect(screen.getByText('No handoff reliability records available.')).toBeInTheDocument();
  });
});
