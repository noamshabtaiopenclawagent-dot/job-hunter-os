import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { ReviewBacklogCleanupEvidenceConsoleWithTriage } from './ReviewBacklogCleanupEvidenceConsoleWithTriage';

describe('ReviewBacklogCleanupEvidenceConsoleWithTriage', () => {
  afterEach(() => {
    cleanup();
  });
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

  it('renders triage panel when hasQaFail is true and blocks interaction until resolved', async () => {
    render(<ReviewBacklogCleanupEvidenceConsoleWithTriage tasks={tasks} hasQaFail={true} />);
    
    // Triage panel should be visible
    expect(screen.getByText('Execution Blocked by QA Failure')).toBeInTheDocument();
    expect(screen.getByText('QA FAIL Triage (OPI Decision Required)')).toBeInTheDocument();

    // After approval, the triage panel should disappear
    fireEvent.click(screen.getByText('Approve fix execution'));
    expect(screen.queryByText('Execution Blocked by QA Failure')).not.toBeInTheDocument();
  });

  it('renders normally when hasQaFail is false', () => {
    render(<ReviewBacklogCleanupEvidenceConsoleWithTriage tasks={tasks} hasQaFail={false} />);
    expect(screen.queryByText('Execution Blocked by QA Failure')).not.toBeInTheDocument();
    expect(screen.getByText('Review Backlog Cleanup Console')).toBeInTheDocument();
  });
});
