import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ApprovalSlaBreachRemediationDrawer } from './ApprovalSlaBreachRemediationDrawer';

describe('ApprovalSlaBreachRemediationDrawer', () => {
  it('renders fallback states', () => {
    const { rerender } = render(<ApprovalSlaBreachRemediationDrawer loading />);
    expect(screen.getByText('Loading approval SLA breaches...')).toBeInTheDocument();
    rerender(<ApprovalSlaBreachRemediationDrawer error="Remediation feed down" />);
    expect(screen.getByText('Remediation feed down')).toBeInTheDocument();
  });

  it('shows explicit pending/success states on action', async () => {
    render(<ApprovalSlaBreachRemediationDrawer />);
    fireEvent.click(screen.getAllByText('Reassign')[0]);
    expect(screen.getByText('Action pending...')).toBeInTheDocument();
    expect(await screen.findByText('Action success.')).toBeInTheDocument();
  });
});
