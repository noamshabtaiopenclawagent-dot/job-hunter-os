import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { CvJdExplainableMatchCalibrationThresholdTuning } from './CvJdExplainableMatchCalibrationThresholdTuning';

afterEach(cleanup);

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
    expect(screen.getAllByText(/Precision/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Calibration/).length).toBeGreaterThan(0);
  });

  it('updates threshold slider', () => {
    render(<CvJdExplainableMatchCalibrationThresholdTuning data={data} />);
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[4], { target: { value: '65' } });
    expect(screen.getByText(/Pass rate/)).toBeInTheDocument();
  });

  it('renders QaFailOpiDecisionTriagePanel when hasQaFail is true and hides component until resolved', () => {
    render(<CvJdExplainableMatchCalibrationThresholdTuning data={data} hasQaFail={true} />);
    expect(screen.getByText(/Execution Blocked by QA Failure/i)).toBeTruthy();
    expect(screen.getByText(/QA FAIL Triage \(OPI Decision Required\)/i)).toBeTruthy();
    
    // Attempt approval
    fireEvent.click(screen.getByText('Approve fix execution'));
    expect(screen.queryByText(/Execution Blocked by QA Failure/i)).toBeNull();
  });
});
