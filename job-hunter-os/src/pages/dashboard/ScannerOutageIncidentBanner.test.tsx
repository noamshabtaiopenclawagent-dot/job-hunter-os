import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ScannerOutageIncidentBanner } from './ScannerOutageIncidentBanner';

describe('ScannerOutageIncidentBanner', () => {
  it('C1 severity-aware banner renders', () => {
    render(<ScannerOutageIncidentBanner incident={{ id: '1', severity: 'critical', impactedSources: 2, message: 'boom' }} />);
    expect(screen.getByText('CRITICAL Scanner Outage')).toBeInTheDocument();
  });

  it('C2 impacted source count renders', () => {
    render(<ScannerOutageIncidentBanner incident={{ id: '2', severity: 'high', impactedSources: 5, message: 'impact' }} />);
    expect(screen.getByText(/Impacted sources: 5/)).toBeInTheDocument();
  });

  it('C3 Retry action works', () => {
    const onRetry = vi.fn();
    render(<ScannerOutageIncidentBanner onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('C4 Open Diagnostics action works', () => {
    const onOpenDiagnostics = vi.fn();
    render(<ScannerOutageIncidentBanner onOpenDiagnostics={onOpenDiagnostics} />);
    fireEvent.click(screen.getByRole('button', { name: 'Open Diagnostics' }));
    expect(onOpenDiagnostics).toHaveBeenCalledTimes(1);
  });

  it('C5 Snooze hides banner', () => {
    render(<ScannerOutageIncidentBanner />);
    fireEvent.click(screen.getByRole('button', { name: 'Snooze' }));
    expect(screen.queryByLabelText('Scanner outage incident banner')).not.toBeInTheDocument();
  });

  it('C6 auto-dismiss hides banner', async () => {
    render(<ScannerOutageIncidentBanner autoDismissMs={10} />);
    await waitFor(() => {
      expect(screen.queryByLabelText('Scanner outage incident banner')).not.toBeInTheDocument();
    });
  });

  it('C7 dismiss persistence writes sessionStorage', () => {
    sessionStorage.clear();
    render(<ScannerOutageIncidentBanner incident={{ id: 'persist-1', severity: 'medium', impactedSources: 1, message: 'persist' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(sessionStorage.getItem('jhos:scanner-outage:dismissed')).toBe('persist-1');
  });
});
