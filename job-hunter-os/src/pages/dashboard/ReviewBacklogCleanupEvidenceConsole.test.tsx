import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReviewBacklogCleanupEvidenceConsole } from './ReviewBacklogCleanupEvidenceConsole';

describe('ReviewBacklogCleanupEvidenceConsole', () => {
  const tasks = [
    {
      id: 'rv1',
      title: 'Task 1',
      artifactPath: '/src/a.tsx',
      integrationDelta: 'Integrated nav',
      kpiProof: 'Verified flow',
      evidenceLinks: ['commit:abc'],
      verified: true,
      closed: false,
    },
  ];

  it('renders empty message when no tasks', () => {
    render(<ReviewBacklogCleanupEvidenceConsole tasks={[]} />);
    expect(screen.getByText('No review tasks loaded.')).toBeInTheDocument();
  });

  it('renders contract fields and close action', () => {
    render(<ReviewBacklogCleanupEvidenceConsole tasks={tasks} />);
    expect(screen.getByText(/Artifact\(path\):/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Close verified task'));
    expect(screen.getByText(/Closing rv1/)).toBeInTheDocument();
  });
});
