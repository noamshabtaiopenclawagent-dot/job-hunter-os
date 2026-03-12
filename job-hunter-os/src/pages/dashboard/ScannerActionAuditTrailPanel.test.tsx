import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ScannerActionAuditTrailPanel } from './ScannerActionAuditTrailPanel';

describe('ScannerActionAuditTrailPanel', () => {
  it('covers log rendering filters details and state variants', () => {
    const { rerender } = render(<ScannerActionAuditTrailPanel />);
    expect(screen.getByText(/retry/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Role filter'), { target: { value: 'manager' } });
    expect(screen.getByText(/diagnostics_opened/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Source filter'), { target: { value: 'referral' } });
    fireEvent.click(screen.getByText(/diagnostics_opened/));
    expect(screen.getByTestId('audit-details')).toBeInTheDocument();
    rerender(<ScannerActionAuditTrailPanel loading />);
    expect(screen.getByText(/Loading audit trail/)).toBeInTheDocument();
    rerender(<ScannerActionAuditTrailPanel error="boom" />);
    expect(screen.getByText('boom')).toBeInTheDocument();
    rerender(<ScannerActionAuditTrailPanel logs={[]} />);
    expect(screen.getByText(/No audit logs found/)).toBeInTheDocument();
  });
});
