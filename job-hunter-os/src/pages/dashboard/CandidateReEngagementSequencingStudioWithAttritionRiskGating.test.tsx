import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CandidateReEngagementSequencingStudioWithAttritionRiskGating } from './CandidateReEngagementSequencingStudioWithAttritionRiskGating';

describe('CandidateReEngagementSequencingStudioWithAttritionRiskGating', () => {
  it('renders gating and fallback states', () => {
    const { rerender } = render(<CandidateReEngagementSequencingStudioWithAttritionRiskGating />);
    expect(screen.getByText(/Noa Levi/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Attrition Risk Gate'), { target: { value: 'high-only' } });
    expect(screen.queryByText(/Maya Cohen/)).not.toBeInTheDocument();

    rerender(<CandidateReEngagementSequencingStudioWithAttritionRiskGating loading />);
    expect(screen.getByText('Loading re-engagement sequencing studio...')).toBeInTheDocument();

    rerender(<CandidateReEngagementSequencingStudioWithAttritionRiskGating error="Sequencing unavailable" />);
    expect(screen.getByText('Sequencing unavailable')).toBeInTheDocument();

    rerender(<CandidateReEngagementSequencingStudioWithAttritionRiskGating data={[]} />);
    expect(screen.getByText('No candidate re-engagement targets available.')).toBeInTheDocument();
  });
});
