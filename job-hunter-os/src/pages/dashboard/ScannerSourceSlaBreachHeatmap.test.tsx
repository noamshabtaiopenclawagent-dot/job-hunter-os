import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ScannerSourceSlaBreachHeatmap } from './ScannerSourceSlaBreachHeatmap';

describe('ScannerSourceSlaBreachHeatmap', () => {
  afterEach(() => cleanup());

  it('C1 renders hourly per-source heatmap cells', () => {
    render(<ScannerSourceSlaBreachHeatmap />);
    expect(screen.getByTitle('AllJobs IL 09:00 • 1 breaches • low')).toBeInTheDocument();
    expect(screen.getByTitle('AllJobs IL 10:00 • 3 breaches • medium')).toBeInTheDocument();
  });

  it('C2 severity color scale is applied', () => {
    render(<ScannerSourceSlaBreachHeatmap />);
    const cell = screen.getByTitle('LinkedIn ISR 09:00 • 5 breaches • high');
    expect(cell).toHaveStyle({ background: 'rgb(254, 202, 202)' });
  });

  it('C3 role filter narrows cells', () => {
    render(<ScannerSourceSlaBreachHeatmap />);
    fireEvent.change(screen.getByLabelText('Role Filter'), { target: { value: 'analyst' } });
    expect(screen.getByTitle('LinkedIn ISR 09:00 • 5 breaches • high')).toBeInTheDocument();
    expect(screen.queryByTitle('Drushim 10:00 • 2 breaches • medium')).not.toBeInTheDocument();
  });

  it('C4 source filter narrows cells', () => {
    render(<ScannerSourceSlaBreachHeatmap />);
    fireEvent.change(screen.getByLabelText('Source Filter'), { target: { value: 'Drushim' } });
    expect(screen.getByTitle('Drushim 10:00 • 2 breaches • medium')).toBeInTheDocument();
    expect(screen.queryByTitle('LinkedIn ISR 09:00 • 5 breaches • high')).not.toBeInTheDocument();
  });

  it('C5 hover titles provide incident context', () => {
    render(<ScannerSourceSlaBreachHeatmap />);
    expect(screen.getByTitle('AllJobs IL 10:00 • 3 breaches • medium')).toBeInTheDocument();
  });

  it('C6 click opens incident drilldown status', () => {
    render(<ScannerSourceSlaBreachHeatmap />);
    fireEvent.click(screen.getByTitle('AllJobs IL 10:00 • 3 breaches • medium'));
    expect(screen.getByText('Incident drilldown opened: inc-102')).toBeInTheDocument();
  });

  it('C7 compact mode still renders cells', () => {
    render(<ScannerSourceSlaBreachHeatmap compact />);
    expect(screen.getByText('1 breaches')).toBeInTheDocument();
  });

  it('C8 loading/empty/error states are handled', () => {
    const { rerender } = render(<ScannerSourceSlaBreachHeatmap loading />);
    expect(screen.getByText('Loading SLA breach heatmap...')).toBeInTheDocument();

    rerender(<ScannerSourceSlaBreachHeatmap data={[]} />);
    expect(screen.getByText('No SLA breach records found.')).toBeInTheDocument();

    rerender(<ScannerSourceSlaBreachHeatmap error="Outage" />);
    expect(screen.getByText('Outage')).toBeInTheDocument();
  });
});
