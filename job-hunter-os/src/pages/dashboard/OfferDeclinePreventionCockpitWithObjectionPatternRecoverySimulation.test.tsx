import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfferDeclinePreventionCockpitWithObjectionPatternRecoverySimulation } from './OfferDeclinePreventionCockpitWithObjectionPatternRecoverySimulation';

describe('OfferDeclinePreventionCockpitWithObjectionPatternRecoverySimulation', () => {
  it('renders baseline and fallback states', () => {
    const { rerender } = render(<OfferDeclinePreventionCockpitWithObjectionPatternRecoverySimulation />);
    expect(screen.getByText('Noa Levi')).toBeInTheDocument();
    expect(screen.getByText('Decline risk: 62%')).toBeInTheDocument();

    rerender(<OfferDeclinePreventionCockpitWithObjectionPatternRecoverySimulation loading />);
    expect(screen.getByText('Loading offer decline prevention cockpit...')).toBeInTheDocument();

    rerender(<OfferDeclinePreventionCockpitWithObjectionPatternRecoverySimulation error="Cockpit unavailable" />);
    expect(screen.getByText('Cockpit unavailable')).toBeInTheDocument();

    rerender(<OfferDeclinePreventionCockpitWithObjectionPatternRecoverySimulation data={[]} />);
    expect(screen.getByText('No objection-pattern scenarios available.')).toBeInTheDocument();
  });
});
