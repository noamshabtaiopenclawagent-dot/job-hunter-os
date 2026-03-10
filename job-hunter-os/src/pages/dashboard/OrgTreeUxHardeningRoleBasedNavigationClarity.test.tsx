import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { OrgTreeUxHardeningRoleBasedNavigationClarity } from './OrgTreeUxHardeningRoleBasedNavigationClarity';

describe('OrgTreeUxHardeningRoleBasedNavigationClarity', () => {
  const nodes = [
    { id: '1', name: 'Lead', role: 'lead' as const, parentId: null, active: true, workload: 70, approvalsPending: 2, slaRisk: 35, priorityAction: 'Approve roadmap order' },
    { id: '2', name: 'Recruiter', role: 'recruiter' as const, parentId: '1', active: true, workload: 80, approvalsPending: 4, slaRisk: 61, priorityAction: 'Escalate candidate' },
  ];

  it('renders empty state', () => {
    render(<OrgTreeUxHardeningRoleBasedNavigationClarity nodes={[]} />);
    expect(screen.getByText('No org-tree nodes loaded.')).toBeInTheDocument();
  });

  it('renders hierarchy and role guidance', () => {
    render(<OrgTreeUxHardeningRoleBasedNavigationClarity nodes={nodes} liveSignalsSnapshot={[{ nodeId: '2', approvalsPending: 7, slaRisk: 80, validatedAt: '2026-03-10T20:40:00Z' }]} />);
    expect(screen.getByText('Hierarchy')).toBeInTheDocument();
    expect(screen.getByText(/Suggested modules/)).toBeInTheDocument();
    expect(screen.getByText(/approvals pending/)).toBeInTheDocument();
    expect(screen.getByText(/SLA risk/)).toBeInTheDocument();
    expect(screen.getByText(/next action/)).toBeInTheDocument();
    expect(screen.getByText(/injected live-signal snapshot/)).toBeInTheDocument();
  });

  it('supports role filtering', () => {
    render(<OrgTreeUxHardeningRoleBasedNavigationClarity nodes={nodes} />);
    fireEvent.change(screen.getByDisplayValue('All roles'), { target: { value: 'recruiter' } });
    expect(screen.getByText('Recruiter')).toBeInTheDocument();
  });
});
