import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScannerSourceDiagnosticsModal } from './ScannerSourceDiagnosticsModal';

describe('ScannerSourceDiagnosticsModal Integration', () => {
  it('receives source_origin from backend mapping and renders', () => {
    // Mocking the backend structure for the test
    const mockBackendData = {
        title: "Test Job",
        company: "Test Co",
        location: "Remote",
        url: "https://example.com/job",
        source: "linkedin",
        source_origin: "https://www.linkedin.com/jobs/search?keywords=test",
        score: 100,
        stage: "shortlist"
    };

    const source = {
      id: 'backend-test-1',
      source: mockBackendData.source,
      source_origin: mockBackendData.source_origin,
      latencySeries: [1, 2, 3],
      failureMeta: [],
      status: 'ready' as const,
    };

    render(<ScannerSourceDiagnosticsModal open source={source} />);
    expect(screen.getByText('linkedin')).toBeTruthy();
    expect(screen.getByText('Origin URL/API:')).toBeTruthy();
    expect(screen.getByText('https://www.linkedin.com/jobs/search?keywords=test')).toBeTruthy();
  });
});
