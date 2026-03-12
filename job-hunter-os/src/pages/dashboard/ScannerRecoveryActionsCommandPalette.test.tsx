import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ScannerRecoveryActionsCommandPalette } from './ScannerRecoveryActionsCommandPalette';

describe('ScannerRecoveryActionsCommandPalette', () => {
  it('C1/C2 open with Ctrl+K and close with Escape', () => {
    render(<ScannerRecoveryActionsCommandPalette />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('C3/C4 searchable grouped actions', () => {
    render(<ScannerRecoveryActionsCommandPalette />);
    fireEvent.click(screen.getByText('Open Palette'));
    expect(screen.getByText(/\[retry\] Retry all sources/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search actions'), { target: { value: 'diagnostics' } });
    expect(screen.getByText(/Open diagnostics/)).toBeInTheDocument();
  });

  it('C5/C6/C7/C8/C9 disabled busy + inline success feedback', async () => {
    render(<ScannerRecoveryActionsCommandPalette busy={true} />);
    fireEvent.click(screen.getByText('Open Palette'));
    expect(screen.getByText(/Retry all sources/)).toBeDisabled();

    render(<ScannerRecoveryActionsCommandPalette busy={false} />);
    fireEvent.click(screen.getAllByText('Open Palette')[1]);
    fireEvent.click(screen.getAllByText(/Retry all sources/)[1]);
    await vi.waitFor(() => expect(screen.getByText(/Success:/)).toBeInTheDocument());
  });
});
