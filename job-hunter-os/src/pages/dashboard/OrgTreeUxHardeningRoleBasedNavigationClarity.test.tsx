import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { OrgTreeUxHardeningRoleBasedNavigationClarity } from './OrgTreeUxHardeningRoleBasedNavigationClarity';

describe('OrgTreeUxHardeningRoleBasedNavigationClarity', () => {
  const nodes = [
    { id: '1', name: 'Lead', role: 'lead' as const, parentId: null, active: true, workload: 70 },
    { id: '2', name: 'Recruiter', role: 'recruiter' as const, parentId: '1', active: true, workload: 80 },
  ];

  it('renders empty state', () => {
    render(<OrgTreeUxHardeningRoleBasedNavigationClarity nodes={[]} />);
    expect(screen.getByText('No org-tree nodes loaded.')).toBeInTheDocument();
  });

  it('renders hierarchy and role guidance', () => {
    render(<OrgTreeUxHardeningRoleBasedNavigationClarity nodes={nodes} />);
    expect(screen.getByText('Hierarchy')).toBeInTheDocument();
    expect(screen.getByText(/Suggested modules/)).toBeInTheDocument();
  });

  it('supports role filtering', () => {
    render(<OrgTreeUxHardeningRoleBasedNavigationClarity nodes={nodes} />);
    fireEvent.change(screen.getByDisplayValue('All roles'), { target: { value: 'recruiter' } });
    expect(screen.getByText('Recruiter')).toBeInTheDocument();
  });
});
