import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { RecruiterCapacityAllocationSandboxWithQueueAgingMitigationOptions } from './RecruiterCapacityAllocationSandboxWithQueueAgingMitigationOptions';

describe('RecruiterCapacityAllocationSandboxWithQueueAgingMitigationOptions', () => {
  it('renders baseline, mitigation interactions, and fallback states', () => {
    const { rerender } = render(<RecruiterCapacityAllocationSandboxWithQueueAgingMitigationOptions />);
    expect(screen.getByText('Dana')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Queue Aging Mitigation'), { target: { value: 'burst' } });
    expect(screen.getByText('Queue aging: 17h')).toBeInTheDocument();

    rerender(<RecruiterCapacityAllocationSandboxWithQueueAgingMitigationOptions loading />);
    expect(screen.getByText('Loading recruiter capacity sandbox...')).toBeInTheDocument();

    rerender(<RecruiterCapacityAllocationSandboxWithQueueAgingMitigationOptions error="Capacity feed unavailable" />);
    expect(screen.getByText('Capacity feed unavailable')).toBeInTheDocument();

    rerender(<RecruiterCapacityAllocationSandboxWithQueueAgingMitigationOptions data={[]} />);
    expect(screen.getByText('No recruiter capacity rows available.')).toBeInTheDocument();
  });
});
