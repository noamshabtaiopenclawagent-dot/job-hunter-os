import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RecruiterHandoffContinuityGuardWithOwnershipGapRecoveryPlanner } from './RecruiterHandoffContinuityGuardWithOwnershipGapRecoveryPlanner';

describe('RecruiterHandoffContinuityGuardWithOwnershipGapRecoveryPlanner', () => {
  it('renders loading state initially and then shows gaps', async () => {
    render(<RecruiterHandoffContinuityGuardWithOwnershipGapRecoveryPlanner />);
    
    // Check loading state
    expect(screen.getByRole('status')).toBeDefined();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Critical Handoff Gaps/)).toBeDefined();
    });
    
    // Check list
    expect(screen.getByText(/Candidate H/)).toBeDefined();
  });

  it('removes gap on recovery action', async () => {
    render(<RecruiterHandoffContinuityGuardWithOwnershipGapRecoveryPlanner />);
    
    await waitFor(() => {
      expect(screen.getByText(/Candidate H/)).toBeDefined();
    });
    
    const recoverButtons = screen.getAllByText('Recover Ownership');
    fireEvent.click(recoverButtons[0]);
    
    await waitFor(() => {
      expect(screen.queryByText(/Candidate H/)).toBeNull();
    });
  });
});
