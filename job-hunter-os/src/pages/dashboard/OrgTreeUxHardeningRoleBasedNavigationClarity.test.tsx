import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { OrgTreeUxHardeningRoleBasedNavigationClarity } from './OrgTreeUxHardeningRoleBasedNavigationClarity';

afterEach(() => cleanup());

describe('OrgTreeUxHardeningRoleBasedNavigationClarity', () => {
  const nodes = [
    { id: '1', name: 'Lead', role: 'lead' as const, parentId: null, active: true, workload: 70, approvalsPending: 2, slaRisk: 35, priorityAction: 'Approve roadmap order' },
    { id: '2', name: 'Recruiter', role: 'recruiter' as const, parentId: '1', active: true, workload: 80, approvalsPending: 4, slaRisk: 61, priorityAction: 'Escalate candidate' },
  ];

  it('renders empty state', () => {
    render(<OrgTreeUxHardeningRoleBasedNavigationClarity nodes={[]} />);
    expect(screen.getByText('No org-tree nodes loaded.')).toBeTruthy();
  });

  it('renders hierarchy and role guidance', () => {
    render(<OrgTreeUxHardeningRoleBasedNavigationClarity nodes={nodes} liveSignalsSnapshot={[{ nodeId: '2', approvalsPending: 7, slaRisk: 80, validatedAt: '2026-03-10T20:40:00Z' }]} liveIntentSnapshot={[{ nodeId: '2', priorityAction: 'Resolve blocked approvals' }]} />);
    expect(screen.getByText('Hierarchy')).toBeTruthy();
    expect(screen.getAllByText(/Suggested modules/).length).toBeGreaterThan(0);
    expect(screen.getByText(/approvals pending/)).toBeTruthy();
    expect(screen.getByText(/SLA risk/)).toBeTruthy();
    expect(screen.getByText(/next action/)).toBeTruthy();
    expect(screen.getByText(/injected live-signal snapshot/)).toBeTruthy();
    expect(screen.getByText(/QA handoff notes for Alex/)).toBeTruthy();
    expect(screen.getByText(/Q1/)).toBeTruthy();
  });

  it('supports role filtering', () => {
    render(<OrgTreeUxHardeningRoleBasedNavigationClarity nodes={nodes} />);
    fireEvent.change(screen.getAllByDisplayValue('All roles')[0], { target: { value: 'recruiter' } });
    expect(screen.getAllByText(/Recruiter/).length).toBeGreaterThan(0);
  });

  it('emits module navigation when suggested module chip is clicked', () => {
    const onNavigateModule = vi.fn();
    render(<OrgTreeUxHardeningRoleBasedNavigationClarity nodes={nodes} onNavigateModule={onNavigateModule} />);
    fireEvent.click(screen.getByRole('button', { name: /Recruiter recruiter/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Navigate to Priority Inbox Smart Triage' }));
    expect(onNavigateModule).toHaveBeenCalledWith('Priority Inbox Smart Triage');
  });
});
