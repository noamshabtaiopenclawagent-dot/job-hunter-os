import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PanelSchedulingConflictResolutionBoardWithSlaPreservingSwapEngine } from './PanelSchedulingConflictResolutionBoardWithSlaPreservingSwapEngine';

describe('PanelSchedulingConflictResolutionBoardWithSlaPreservingSwapEngine', () => {
  it('renders baseline and fallback states', () => {
    const { rerender } = render(<PanelSchedulingConflictResolutionBoardWithSlaPreservingSwapEngine />);
    expect(screen.getByText('Backend Panel A')).toBeInTheDocument();
    expect(screen.getByText('SLA risk: high')).toBeInTheDocument();

    rerender(<PanelSchedulingConflictResolutionBoardWithSlaPreservingSwapEngine loading />);
    expect(screen.getByText('Loading scheduling conflict board...')).toBeInTheDocument();

    rerender(<PanelSchedulingConflictResolutionBoardWithSlaPreservingSwapEngine error="Scheduler unavailable" />);
    expect(screen.getByText('Scheduler unavailable')).toBeInTheDocument();

    rerender(<PanelSchedulingConflictResolutionBoardWithSlaPreservingSwapEngine data={[]} />);
    expect(screen.getByText('No panel scheduling conflicts detected.')).toBeInTheDocument();
  });
});
