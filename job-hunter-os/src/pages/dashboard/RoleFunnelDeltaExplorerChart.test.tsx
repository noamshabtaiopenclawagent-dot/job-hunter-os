import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { RoleFunnelDeltaExplorerChart } from './RoleFunnelDeltaExplorerChart';

describe('RoleFunnelDeltaExplorerChart', () => {
  it('renders and recomputes deltas by baseline', () => {
    render(<RoleFunnelDeltaExplorerChart />);
    expect(screen.getByText('Role Funnel Delta Explorer Chart')).toBeInTheDocument();
    expect(screen.getByText('Δ Interview vs baseline: 0')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Baseline role'), { target: { value: 'manager' } });
    expect(screen.getByText('Δ Interview vs baseline: 36')).toBeInTheDocument();
  });
});
