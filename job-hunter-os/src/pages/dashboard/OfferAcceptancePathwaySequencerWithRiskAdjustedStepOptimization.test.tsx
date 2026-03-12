import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { OfferAcceptancePathwaySequencerWithRiskAdjustedStepOptimization } from './OfferAcceptancePathwaySequencerWithRiskAdjustedStepOptimization';

describe('OfferAcceptancePathwaySequencerWithRiskAdjustedStepOptimization', () => {
  it('covers baseline and fallback states', () => {
    const { rerender } = render(<OfferAcceptancePathwaySequencerWithRiskAdjustedStepOptimization />);
    expect(screen.getByText('Comp alignment')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Risk optimization'), { target: { value: '20' } });
    expect(screen.getByText('Adjusted risk: 41')).toBeInTheDocument();

    rerender(<OfferAcceptancePathwaySequencerWithRiskAdjustedStepOptimization loading />);
    expect(screen.getByText('Loading offer acceptance pathway...')).toBeInTheDocument();

    rerender(<OfferAcceptancePathwaySequencerWithRiskAdjustedStepOptimization error="Sequencer unavailable" />);
    expect(screen.getByText('Sequencer unavailable')).toBeInTheDocument();

    rerender(<OfferAcceptancePathwaySequencerWithRiskAdjustedStepOptimization data={[]} />);
    expect(screen.getByText('No offer acceptance steps available.')).toBeInTheDocument();
  });
});
