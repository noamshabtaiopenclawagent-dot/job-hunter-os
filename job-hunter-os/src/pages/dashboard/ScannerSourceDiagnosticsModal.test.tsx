import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ScannerSourceDiagnosticsModal } from './ScannerSourceDiagnosticsModal';

afterEach(() => cleanup());

describe('ScannerSourceDiagnosticsModal (10 checks)', () => {
  const source = {
    id: '1',
    source: 'AllJobs IL',
    source_origin: 'https://alljobs.il/api/v2',
    latencySeries: [1, 2, 3, 2],
    failureMeta: [{ key: 'error', value: '429' }],
    status: 'ready' as const,
  };

  it('C1/C2 metadata + sparkline + origin', () => {
    render(<ScannerSourceDiagnosticsModal open source={source} />);
    expect(screen.getByText(/Failure metadata/)).toBeTruthy();
    expect(screen.getByLabelText('latency-sparkline')).toBeTruthy();
    expect(screen.getByText(/Origin URL\/API:/)).toBeTruthy();
    expect(screen.getByText(/alljobs.il/)).toBeTruthy();
  });

  it('C3/C4/C5 action buttons present', () => {
    render(<ScannerSourceDiagnosticsModal open source={source} />);
    expect(screen.getAllByText('Retry').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Pause').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Report').length).toBeGreaterThan(0);
  });

  it('C6 loading state', () => {
    render(<ScannerSourceDiagnosticsModal open source={{ ...source, status: 'loading' }} />);
    expect(screen.getByText(/Loading diagnostics/)).toBeTruthy();
  });

  it('C7 empty state', () => {
    render(<ScannerSourceDiagnosticsModal open source={{ ...source, status: 'empty' }} />);
    expect(screen.getByText(/No diagnostics available/)).toBeTruthy();
  });

  it('C8 error state', () => {
    render(<ScannerSourceDiagnosticsModal open source={{ ...source, status: 'error' }} />);
    expect(screen.getByText(/Diagnostics unavailable/)).toBeTruthy();
  });

  it('C9 escape closes modal', () => {
    let closed = false;
    render(<ScannerSourceDiagnosticsModal open source={source} onClose={() => { closed = true; }} />);
    fireEvent.keyDown(screen.getAllByRole('dialog')[0], { key: 'Escape' });
    expect(closed).toBe(true);
  });

  it('C10 tab focus trap updates index', () => {
    render(<ScannerSourceDiagnosticsModal open source={source} />);
    fireEvent.keyDown(screen.getAllByRole('dialog')[0], { key: 'Tab' });
    expect(screen.getByText(/Focus trap index:/)).toBeTruthy();
  });
});
