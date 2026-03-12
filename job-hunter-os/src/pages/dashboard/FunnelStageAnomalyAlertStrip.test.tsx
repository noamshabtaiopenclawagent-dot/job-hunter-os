import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FunnelStageAnomalyAlertStrip } from './FunnelStageAnomalyAlertStrip';

describe('FunnelStageAnomalyAlertStrip', () => {
  it('validates threshold/filter/drilldown/dismiss/snooze behaviors', () => {
    render(<FunnelStageAnomalyAlertStrip />);
    expect(screen.getByText(/screen • 81/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Threshold'), { target: { value: 80 } });
    expect(screen.queryByText(/interview • 74/)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Threshold'), { target: { value: 70 } });
    fireEvent.change(screen.getByLabelText('Role'), { target: { value: 'coordinator' } });
    expect(screen.getByText(/interview • 74/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/interview • 74/));
    expect(screen.getByTestId('drilldown')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Snooze'));
    expect(screen.queryByText(/interview • 74/)).not.toBeInTheDocument();
  });
});
