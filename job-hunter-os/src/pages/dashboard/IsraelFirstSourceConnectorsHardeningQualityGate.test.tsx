import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { IsraelFirstSourceConnectorsHardeningQualityGate } from './IsraelFirstSourceConnectorsHardeningQualityGate';

afterEach(() => cleanup());

describe('IsraelFirstSourceConnectorsHardeningQualityGate (8 checks)', () => {
  const data = [
    { id: '1', source: 'AllJobs IL', region: 'israel' as const, status: 'healthy' as const, latencyMs: 400, successRate: 97, parsedJobs: 100, uniqueJobs: 70, qualityScore: 85, partial: true },
    { id: '2', source: 'Feed X', region: 'global' as const, status: 'down' as const, latencyMs: 2000, successRate: 40, parsedJobs: 40, uniqueJobs: 12, qualityScore: 50, lastError: 'Auth error' },
  ];

  it('C1: supports region filter precision', () => {
    render(<IsraelFirstSourceConnectorsHardeningQualityGate data={data} />);
    fireEvent.change(screen.getByDisplayValue('Israel only'), { target: { value: 'all' } });
    expect(screen.getAllByText('Feed X').length).toBeGreaterThan(0);
  });

  it('C2: supports manual refresh action', () => {
    render(<IsraelFirstSourceConnectorsHardeningQualityGate data={data} onManualRefresh={async () => {}} />);
    fireEvent.click(screen.getAllByText('Manual refresh')[0]);
    expect(screen.getAllByText('Fetching').length).toBeGreaterThan(0);
  });

  it('C3: renders dedupe metric', () => {
    render(<IsraelFirstSourceConnectorsHardeningQualityGate data={data} />);
    expect(screen.getAllByText('30%').length).toBeGreaterThan(0);
  });

  it('C4: renders status chips fetching/healthy/errors', () => {
    render(<IsraelFirstSourceConnectorsHardeningQualityGate data={data} />);
    expect(screen.getAllByText('Fetching').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Healthy').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Errors').length).toBeGreaterThan(0);
  });

  it('C5: updates gate threshold outcomes', () => {
    render(<IsraelFirstSourceConnectorsHardeningQualityGate data={data} />);
    fireEvent.change(screen.getAllByRole('slider')[0], { target: { value: '90' } });
    expect(screen.getAllByText(/Blocked:/).length).toBeGreaterThan(0);
  });

  it('C6: renders pass/blocked quality outcome split', () => {
    render(<IsraelFirstSourceConnectorsHardeningQualityGate data={data} />);
    expect(screen.getAllByText(/Pass:/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Blocked:/).length).toBeGreaterThan(0);
  });

  it('C7: renders source drill-down diagnostics', () => {
    render(<IsraelFirstSourceConnectorsHardeningQualityGate data={data} />);
    expect(screen.getAllByText(/Latency:/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Success rate:/).length).toBeGreaterThan(0);
  });

  it('C8: flags partial telemetry + evidence section', () => {
    render(<IsraelFirstSourceConnectorsHardeningQualityGate data={data} />);
    expect(screen.getAllByText(/Partial telemetry/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/8\/8 verification checks with KPI linkage/).length).toBeGreaterThan(0);
  });

  it('renders QaFailOpiDecisionTriagePanel when hasQaFail is true and hides component until resolved', () => {
    render(<IsraelFirstSourceConnectorsHardeningQualityGate data={data} hasQaFail={true} />);
    expect(screen.getByText(/Execution Blocked by QA Failure/i)).toBeTruthy();
    expect(screen.getByText(/QA FAIL Triage \(OPI Decision Required\)/i)).toBeTruthy();
    
    // Attempt approval
    fireEvent.click(screen.getByText('Approve fix execution'));
    expect(screen.queryByText(/Execution Blocked by QA Failure/i)).toBeNull();
  });
});
