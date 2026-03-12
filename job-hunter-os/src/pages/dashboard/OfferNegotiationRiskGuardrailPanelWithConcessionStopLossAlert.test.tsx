import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfferNegotiationRiskGuardrailPanelWithConcessionStopLossAlert } from './OfferNegotiationRiskGuardrailPanelWithConcessionStopLossAlert';

describe('OfferNegotiationRiskGuardrailPanelWithConcessionStopLossAlert', () => {
  it('handles loading/error/empty states explicitly', () => {
    const { rerender } = render(<OfferNegotiationRiskGuardrailPanelWithConcessionStopLossAlert loading />);
    expect(screen.getByText('Loading negotiation risk context...')).toBeInTheDocument();
    rerender(<OfferNegotiationRiskGuardrailPanelWithConcessionStopLossAlert error="Risk stream unavailable" />);
    expect(screen.getByText('Risk stream unavailable')).toBeInTheDocument();
    rerender(<OfferNegotiationRiskGuardrailPanelWithConcessionStopLossAlert data={[]} />);
    expect(screen.getByText('No negotiation context available.')).toBeInTheDocument();
  });
});
