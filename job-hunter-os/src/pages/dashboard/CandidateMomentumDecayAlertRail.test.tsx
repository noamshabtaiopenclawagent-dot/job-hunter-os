import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CandidateMomentumDecayAlertRail } from './CandidateMomentumDecayAlertRail';

describe('CandidateMomentumDecayAlertRail', () => {
  afterEach(() => cleanup());

  it('renders loading/error/empty fallback states', () => {
    const loadingView = render(<CandidateMomentumDecayAlertRail loading />);
    expect(screen.getByText('Loading momentum decay alerts...')).toBeInTheDocument();
    loadingView.unmount();

    const errorView = render(<CandidateMomentumDecayAlertRail error="Decay feed error" />);
    expect(screen.getByText('Decay feed error')).toBeInTheDocument();
    errorView.unmount();

    render(<CandidateMomentumDecayAlertRail data={[]} />);
    expect(screen.getByText('No momentum decay alerts.')).toBeInTheDocument();
  });

  it('supports quick action optimistic removal', () => {
    render(<CandidateMomentumDecayAlertRail />);
    expect(screen.getAllByRole('article')).toHaveLength(2);
    fireEvent.click(screen.getAllByText('Follow-up')[0]);
    expect(screen.getAllByRole('article')).toHaveLength(1);
  });
});
// CandidateMomentumDecayAlertRail.test
