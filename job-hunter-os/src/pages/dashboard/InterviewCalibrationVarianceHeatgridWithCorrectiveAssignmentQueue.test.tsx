import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { InterviewCalibrationVarianceHeatgridWithCorrectiveAssignmentQueue } from './InterviewCalibrationVarianceHeatgridWithCorrectiveAssignmentQueue';

describe('InterviewCalibrationVarianceHeatgridWithCorrectiveAssignmentQueue', () => {
  it('renders cells and queue action with fallback states', () => {
    const { rerender } = render(<InterviewCalibrationVarianceHeatgridWithCorrectiveAssignmentQueue />);
    expect(screen.getByText('Interviewer A')).toBeInTheDocument();
    fireEvent.click(screen.getAllByText('Queue Corrective Assignment')[0]);
    expect(screen.getByText('Queued corrective assignments: 1')).toBeInTheDocument();

    rerender(<InterviewCalibrationVarianceHeatgridWithCorrectiveAssignmentQueue loading />);
    expect(screen.getByText('Loading calibration variance heatgrid...')).toBeInTheDocument();

    rerender(<InterviewCalibrationVarianceHeatgridWithCorrectiveAssignmentQueue error="Calibration feed unavailable" />);
    expect(screen.getByText('Calibration feed unavailable')).toBeInTheDocument();

    rerender(<InterviewCalibrationVarianceHeatgridWithCorrectiveAssignmentQueue data={[]} />);
    expect(screen.getByText('No calibration variance records available.')).toBeInTheDocument();
  });
});
