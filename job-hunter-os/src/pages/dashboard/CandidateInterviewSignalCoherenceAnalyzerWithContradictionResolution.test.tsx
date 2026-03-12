import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CandidateInterviewSignalCoherenceAnalyzerWithContradictionResolution } from './CandidateInterviewSignalCoherenceAnalyzerWithContradictionResolution';

describe('CandidateInterviewSignalCoherenceAnalyzerWithContradictionResolution', () => {
  it('renders baseline and loading/error/empty fallback states', () => {
    const { rerender } = render(<CandidateInterviewSignalCoherenceAnalyzerWithContradictionResolution />);
    expect(screen.getByText('Noa Levi')).toBeInTheDocument();
    expect(screen.getByText('Coherence score: 71%')).toBeInTheDocument();

    rerender(<CandidateInterviewSignalCoherenceAnalyzerWithContradictionResolution loading />);
    expect(screen.getByText('Loading interview signal coherence analyzer...')).toBeInTheDocument();

    rerender(<CandidateInterviewSignalCoherenceAnalyzerWithContradictionResolution error="Signal feed unavailable" />);
    expect(screen.getByText('Signal feed unavailable')).toBeInTheDocument();

    rerender(<CandidateInterviewSignalCoherenceAnalyzerWithContradictionResolution data={[]} />);
    expect(screen.getByText('No interview signal records available.')).toBeInTheDocument();
  });
});
