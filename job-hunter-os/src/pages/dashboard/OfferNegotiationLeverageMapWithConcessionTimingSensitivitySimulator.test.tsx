import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OfferNegotiationLeverageMapWithConcessionTimingSensitivitySimulator from './OfferNegotiationLeverageMapWithConcessionTimingSensitivitySimulator';

describe('OfferNegotiationLeverageMapWithConcessionTimingSensitivitySimulator', () => {
  it('renders the map title', () => {
    render(<OfferNegotiationLeverageMapWithConcessionTimingSensitivitySimulator />);
    expect(screen.getByText('Offer Negotiation Leverage Map')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<OfferNegotiationLeverageMapWithConcessionTimingSensitivitySimulator />);
    expect(screen.getByText('Analyze negotiation leverage and simulate concession timing.')).toBeInTheDocument();
  });
});
