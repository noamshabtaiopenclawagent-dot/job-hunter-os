import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecruiterSlaBreachForecasterWithInterventionConfidenceStacking } from './RecruiterSlaBreachForecasterWithInterventionConfidenceStacking';

describe('RecruiterSlaBreachForecasterWithInterventionConfidenceStacking', () => {
  it('renders baseline plus loading/error/empty states', () => {
    const { rerender } = render(<RecruiterSlaBreachForecasterWithInterventionConfidenceStacking />);
    expect(screen.getByText('Dana')).toBeInTheDocument();
    expect(screen.getByText('Forecast breach risk: 72%')).toBeInTheDocument();

    rerender(<RecruiterSlaBreachForecasterWithInterventionConfidenceStacking loading />);
    expect(screen.getByText('Loading recruiter SLA forecaster...')).toBeInTheDocument();

    rerender(<RecruiterSlaBreachForecasterWithInterventionConfidenceStacking error="Forecaster unavailable" />);
    expect(screen.getByText('Forecaster unavailable')).toBeInTheDocument();

    rerender(<RecruiterSlaBreachForecasterWithInterventionConfidenceStacking data={[]} />);
    expect(screen.getByText('No SLA breach forecasts available.')).toBeInTheDocument();
  });
});
