import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RecruiterPipelineReboundPlannerWithStalledStageRecoverySequences from './RecruiterPipelineReboundPlannerWithStalledStageRecoverySequences';

describe('RecruiterPipelineReboundPlannerWithStalledStageRecoverySequences', () => {
  it('renders the planner title', () => {
    render(<RecruiterPipelineReboundPlannerWithStalledStageRecoverySequences />);
    expect(screen.getByText('Recruiter Pipeline Rebound Planner')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<RecruiterPipelineReboundPlannerWithStalledStageRecoverySequences />);
    expect(screen.getByText('Manage stalled stages and execute recovery sequences.')).toBeInTheDocument();
  });
});
