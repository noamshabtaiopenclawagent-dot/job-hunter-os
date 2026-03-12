import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ScannerIncidentHistoryTimelineDrawer } from './ScannerIncidentHistoryTimelineDrawer';

describe('ScannerIncidentHistoryTimelineDrawer', () => {
  it('renders drawer, filters status, and can close/reopen', () => {
    render(<ScannerIncidentHistoryTimelineDrawer />);
    expect(screen.getByText('Scanner Incident History Timeline')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Status filter'), { target: { value: 'open' } });
    expect(screen.getByText(/Auth token rejected/)).toBeInTheDocument();
    expect(screen.queryByText(/Rate limit spikes/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Close'));
    expect(screen.getByText('Open incident history')).toBeInTheDocument();
  });
});
