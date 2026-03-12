import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InterviewPanelFairnessBalancerWithBiasDriftInterventionPlanner } from './InterviewPanelFairnessBalancerWithBiasDriftInterventionPlanner';

describe('InterviewPanelFairnessBalancerWithBiasDriftInterventionPlanner', () => {
  it('renders baseline and fallback states', () => {
    const { rerender } = render(<InterviewPanelFairnessBalancerWithBiasDriftInterventionPlanner />);
    expect(screen.getByText('Backend Loop')).toBeInTheDocument();
    expect(screen.getByText('Bias drift: 14%')).toBeInTheDocument();

    rerender(<InterviewPanelFairnessBalancerWithBiasDriftInterventionPlanner loading />);
    expect(screen.getByText('Loading panel fairness balancer...')).toBeInTheDocument();

    rerender(<InterviewPanelFairnessBalancerWithBiasDriftInterventionPlanner error="Fairness feed unavailable" />);
    expect(screen.getByText('Fairness feed unavailable')).toBeInTheDocument();

    rerender(<InterviewPanelFairnessBalancerWithBiasDriftInterventionPlanner data={[]} />);
    expect(screen.getByText('No panel fairness records available.')).toBeInTheDocument();
  });
});
