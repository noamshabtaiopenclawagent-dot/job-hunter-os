import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfferApprovalLatencyCommandCenterWithDependencyCriticalPathSurfacing } from './OfferApprovalLatencyCommandCenterWithDependencyCriticalPathSurfacing';

describe('OfferApprovalLatencyCommandCenterWithDependencyCriticalPathSurfacing', () => {
  it('renders baseline plus loading/error/empty fallback states', () => {
    const { rerender } = render(<OfferApprovalLatencyCommandCenterWithDependencyCriticalPathSurfacing />);
    expect(screen.getByText('Finance sign-off')).toBeInTheDocument();
    expect(screen.getAllByText('Critical path dependency').length).toBeGreaterThan(0);

    rerender(<OfferApprovalLatencyCommandCenterWithDependencyCriticalPathSurfacing loading />);
    expect(screen.getByText('Loading offer approval latency command center...')).toBeInTheDocument();

    rerender(<OfferApprovalLatencyCommandCenterWithDependencyCriticalPathSurfacing error="Latency feed unavailable" />);
    expect(screen.getByText('Latency feed unavailable')).toBeInTheDocument();

    rerender(<OfferApprovalLatencyCommandCenterWithDependencyCriticalPathSurfacing data={[]} />);
    expect(screen.getByText('No approval latency dependencies available.')).toBeInTheDocument();
  });
});
