import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CandidateStageSlaClockBadges } from './CandidateStageSlaClockBadges';

describe('CandidateStageSlaClockBadges', () => {
  it('C1 renders title', () => {
    render(<CandidateStageSlaClockBadges />);
    expect(screen.getByText('Candidate Stage SLA Clock Badges')).toBeInTheDocument();
  });

  it('C2 role filter works', () => {
    render(<CandidateStageSlaClockBadges />);
    fireEvent.change(screen.getByLabelText('Role filter'), { target: { value: 'coordinator' } });
    expect(screen.getByText(/Omri Tal/)).toBeInTheDocument();
    expect(screen.queryByText(/Noa Levi/)).not.toBeInTheDocument();
  });

  it('C3 urgency badge shows overdue color bucket content', () => {
    render(<CandidateStageSlaClockBadges />);
    expect(screen.getByText('-15m')).toBeInTheDocument();
  });

  it('C4 tooltip overdue breakdown exists', () => {
    render(<CandidateStageSlaClockBadges />);
    expect(screen.getByTitle('Overdue by 15 minute(s)')).toBeInTheDocument();
  });

  it('C5 minute tick updates value', () => {
    vi.useFakeTimers();
    render(<CandidateStageSlaClockBadges />);
    expect(screen.getByText('22m')).toBeInTheDocument();
    vi.advanceTimersByTime(60000);
    expect(screen.getByText('21m')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('C6 virtualization meta start/end/overscan/rowHeight shown', () => {
    render(<CandidateStageSlaClockBadges />);
    expect(screen.getByTestId('virtual-window-meta').textContent).toContain('start:0');
    expect(screen.getByTestId('virtual-window-meta').textContent).toContain('overscan:2');
    expect(screen.getByTestId('virtual-window-meta').textContent).toContain('rowHeight:44');
  });

  it('C7 virtualized list container exists', () => {
    render(<CandidateStageSlaClockBadges />);
    expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
  });

  it('C8 scrolling updates start index', () => {
    const data = Array.from({ length: 30 }, (_, i) => ({ id: String(i), candidate: `C${i}`, role: 'recruiter' as const, stage: 'screen', minutesRemaining: 40 }));
    render(<CandidateStageSlaClockBadges data={data} />);
    const list = screen.getByTestId('virtualized-list');
    Object.defineProperty(list, 'scrollTop', { value: 88, configurable: true });
    fireEvent.scroll(list);
    expect(screen.getByTestId('virtual-window-meta').textContent).toContain('start:2');
  });

  it('C9 row windowing limits rendered rows', () => {
    const data = Array.from({ length: 50 }, (_, i) => ({ id: String(i), candidate: `C${i}`, role: 'recruiter' as const, stage: 'screen', minutesRemaining: 40 }));
    render(<CandidateStageSlaClockBadges data={data} />);
    expect(screen.queryByText('C20 • screen')).not.toBeInTheDocument();
  });
});
