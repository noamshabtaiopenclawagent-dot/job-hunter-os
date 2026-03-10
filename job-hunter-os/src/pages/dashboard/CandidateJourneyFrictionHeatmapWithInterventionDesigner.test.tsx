import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CandidateJourneyFrictionHeatmapWithInterventionDesigner } from './CandidateJourneyFrictionHeatmapWithInterventionDesigner';

describe('CandidateJourneyFrictionHeatmapWithInterventionDesigner', () => {
  const data = [
    { id: 'f1', role: 'Data Analyst' as const, source: 'linkedin' as const, stage: 'screen' as const, volume: 100, dropOffRate: 30, avgCycleDays: 10, drivers: [{ label: 'Scheduling lag', impact: 40 }] },
    { id: 'f2', role: 'Data Analyst' as const, source: 'linkedin' as const, stage: 'interview' as const, volume: 80, dropOffRate: 20, avgCycleDays: 12, drivers: [{ label: 'Panel load', impact: 25 }] },
  ];

  it('renders empty state', () => {
    render(<CandidateJourneyFrictionHeatmapWithInterventionDesigner data={[]} />);
    expect(screen.getByText('No journey telemetry available.')).toBeInTheDocument();
  });

  it('renders heatmap and intervention chips', () => {
    render(<CandidateJourneyFrictionHeatmapWithInterventionDesigner data={data} />);
    expect(screen.getByText('Candidate Journey Friction Heatmap')).toBeInTheDocument();
    expect(screen.getByText(/conversion/)).toBeInTheDocument();
  });

  it('updates projection when intervention sliders change', () => {
    render(<CandidateJourneyFrictionHeatmapWithInterventionDesigner data={data} />);
    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '0' } });
    expect(screen.getByText(/Projected drop-off/)).toBeInTheDocument();
  });
});
