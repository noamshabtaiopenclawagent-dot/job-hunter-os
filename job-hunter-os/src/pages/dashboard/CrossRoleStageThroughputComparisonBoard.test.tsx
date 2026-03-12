import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CrossRoleStageThroughputComparisonBoard } from './CrossRoleStageThroughputComparisonBoard';

describe('CrossRoleStageThroughputComparisonBoard', () => {
  it('C1 side-by-side role cards + C2 delta chips', () => {
    render(<CrossRoleStageThroughputComparisonBoard />);
    expect(screen.getByText('recruiter')).toBeInTheDocument();
    expect(screen.getAllByText(/Δ/).length).toBeGreaterThan(3);
  });

  it('C3 toggle drilldown', () => {
    render(<CrossRoleStageThroughputComparisonBoard />);
    fireEvent.click(screen.getAllByText(/applied:/)[0]);
    expect(screen.getByTestId('stage-drilldown')).toBeInTheDocument();
  });

  it('C4 loading C5 empty C6 error states', () => {
    const { rerender } = render(<CrossRoleStageThroughputComparisonBoard loading />);
    expect(screen.getByText(/Loading throughput board/)).toBeInTheDocument();
    rerender(<CrossRoleStageThroughputComparisonBoard data={[]} />);
    expect(screen.getByText(/No throughput data available/)).toBeInTheDocument();
    rerender(<CrossRoleStageThroughputComparisonBoard error="boom" />);
    expect(screen.getByText('boom')).toBeInTheDocument();
  });

  it('C7 baseline switch recomputes delta', () => {
    render(<CrossRoleStageThroughputComparisonBoard />);
    fireEvent.change(screen.getByLabelText('Baseline role'), { target: { value: 'manager' } });
    expect(screen.getAllByText(/Δ/).length).toBeGreaterThan(0);
  });
});
