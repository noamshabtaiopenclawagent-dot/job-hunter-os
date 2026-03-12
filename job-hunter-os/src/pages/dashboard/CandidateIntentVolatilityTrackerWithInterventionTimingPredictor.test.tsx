import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CandidateIntentVolatilityTrackerWithInterventionTimingPredictor } from './CandidateIntentVolatilityTrackerWithInterventionTimingPredictor';

describe('CandidateIntentVolatilityTrackerWithInterventionTimingPredictor', () => {
  it('renders baseline and fallback states', () => {
    const { rerender } = render(<CandidateIntentVolatilityTrackerWithInterventionTimingPredictor />);
    expect(screen.getByText('Noa Levi')).toBeInTheDocument();
    expect(screen.getByText('Volatility score: 67')).toBeInTheDocument();

    rerender(<CandidateIntentVolatilityTrackerWithInterventionTimingPredictor loading />);
    expect(screen.getByText('Loading intent volatility tracker...')).toBeInTheDocument();

    rerender(<CandidateIntentVolatilityTrackerWithInterventionTimingPredictor error="Volatility feed unavailable" />);
    expect(screen.getByText('Volatility feed unavailable')).toBeInTheDocument();

    rerender(<CandidateIntentVolatilityTrackerWithInterventionTimingPredictor data={[]} />);
    expect(screen.getByText('No candidate intent volatility records available.')).toBeInTheDocument();
  });
});
