import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SourceLevelDedupeImpactDashboardCard } from './SourceLevelDedupeImpactDashboardCard';

describe('SourceLevelDedupeImpactDashboardCard', () => {
  it('renders dedupe before/after and reduction metrics', () => {
    render(<SourceLevelDedupeImpactDashboardCard />);
    expect(screen.getByText('Source-level Dedupe Impact')).toBeInTheDocument();
    expect(screen.getByText(/AllJobs IL/)).toBeInTheDocument();
    expect(screen.getByText(/Reduced:/)).toBeInTheDocument();
  });
});
