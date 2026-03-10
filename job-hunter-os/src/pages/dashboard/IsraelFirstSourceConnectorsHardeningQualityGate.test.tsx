import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { IsraelFirstSourceConnectorsHardeningQualityGate } from './IsraelFirstSourceConnectorsHardeningQualityGate';

describe('IsraelFirstSourceConnectorsHardeningQualityGate', () => {
  const data = [
    { id: '1', source: 'AllJobs IL', region: 'israel' as const, status: 'healthy' as const, latencyMs: 400, successRate: 97, parsedJobs: 100, uniqueJobs: 70, qualityScore: 85 },
    { id: '2', source: 'Feed X', region: 'global' as const, status: 'down' as const, latencyMs: 2000, successRate: 40, parsedJobs: 40, uniqueJobs: 12, qualityScore: 50 },
  ];

  it('renders empty state', () => {
    render(<IsraelFirstSourceConnectorsHardeningQualityGate data={[]} />);
    expect(screen.getByText('No connector data loaded.')).toBeInTheDocument();
  });

  it('renders quality gate chips', () => {
    render(<IsraelFirstSourceConnectorsHardeningQualityGate data={data} />);
    expect(screen.getByText(/Pass:/)).toBeInTheDocument();
    expect(screen.getByText(/Blocked:/)).toBeInTheDocument();
  });

  it('supports region filter change', () => {
    render(<IsraelFirstSourceConnectorsHardeningQualityGate data={data} />);
    fireEvent.change(screen.getByDisplayValue('Israel only'), { target: { value: 'all' } });
    expect(screen.getByText('Feed X')).toBeInTheDocument();
  });
});
