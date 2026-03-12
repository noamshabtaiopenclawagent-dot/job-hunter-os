import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecruiterPipelineInterventionMemoryBoardWithTacticEffectiveness } from './RecruiterPipelineInterventionMemoryBoardWithTacticEffectiveness';

describe('RecruiterPipelineInterventionMemoryBoardWithTacticEffectiveness', () => {
  it('covers C1-C8 baseline + fallback states', () => {
    const { rerender } = render(<RecruiterPipelineInterventionMemoryBoardWithTacticEffectiveness />);
    expect(screen.getByText('24h follow-up cadence')).toBeInTheDocument();
    expect(screen.getByText('Effectiveness: 68%')).toBeInTheDocument();

    rerender(<RecruiterPipelineInterventionMemoryBoardWithTacticEffectiveness loading />);
    expect(screen.getByText('Loading intervention memory board...')).toBeInTheDocument();

    rerender(<RecruiterPipelineInterventionMemoryBoardWithTacticEffectiveness error="Memory feed unavailable" />);
    expect(screen.getByText('Memory feed unavailable')).toBeInTheDocument();

    rerender(<RecruiterPipelineInterventionMemoryBoardWithTacticEffectiveness data={[]} />);
    expect(screen.getByText('No intervention memory entries available.')).toBeInTheDocument();
  });
});
