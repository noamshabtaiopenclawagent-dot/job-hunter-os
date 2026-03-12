import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecruiterFollowUpCadenceOptimizerWithResponseFatigueGuardrails } from './RecruiterFollowUpCadenceOptimizerWithResponseFatigueGuardrails';

describe('RecruiterFollowUpCadenceOptimizerWithResponseFatigueGuardrails', () => {
  it('renders baseline and fallback states', () => {
    const { rerender } = render(<RecruiterFollowUpCadenceOptimizerWithResponseFatigueGuardrails />);
    expect(screen.getByText('Dana')).toBeInTheDocument();
    expect(screen.getByText('Fatigue risk: high')).toBeInTheDocument();

    rerender(<RecruiterFollowUpCadenceOptimizerWithResponseFatigueGuardrails loading />);
    expect(screen.getByText('Loading follow-up cadence optimizer...')).toBeInTheDocument();

    rerender(<RecruiterFollowUpCadenceOptimizerWithResponseFatigueGuardrails error="Cadence feed unavailable" />);
    expect(screen.getByText('Cadence feed unavailable')).toBeInTheDocument();

    rerender(<RecruiterFollowUpCadenceOptimizerWithResponseFatigueGuardrails data={[]} />);
    expect(screen.getByText('No cadence optimization records available.')).toBeInTheDocument();
  });
});
