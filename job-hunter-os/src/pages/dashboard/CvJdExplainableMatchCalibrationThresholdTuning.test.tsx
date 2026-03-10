import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CvJdExplainableMatchCalibrationThresholdTuning } from './CvJdExplainableMatchCalibrationThresholdTuning';

describe('CvJdExplainableMatchCalibrationThresholdTuning', () => {
  const data = [
    { id: '1', candidate: 'A', role: 'Data Analyst', skillsFit: 80, domainFit: 70, seniorityFit: 75, locationFit: 90, historicalOutcome: 'advanced' as const },
    { id: '2', candidate: 'B', role: 'Product Analyst', skillsFit: 50, domainFit: 60, seniorityFit: 55, locationFit: 80, historicalOutcome: 'rejected' as const },
  ];

  it('renders empty state', () => {
    render(<CvJdExplainableMatchCalibrationThresholdTuning data={[]} />);
    expect(screen.getByText('No match records available.')).toBeInTheDocument();
  });

  it('renders KPI chips', () => {
    render(<CvJdExplainableMatchCalibrationThresholdTuning data={data} />);
    expect(screen.getByText(/Precision/)).toBeInTheDocument();
    expect(screen.getByText(/Calibration/)).toBeInTheDocument();
  });

  it('updates threshold slider', () => {
    render(<CvJdExplainableMatchCalibrationThresholdTuning data={data} />);
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[4], { target: { value: '65' } });
    expect(screen.getByText(/Pass rate/)).toBeInTheDocument();
  });
});
