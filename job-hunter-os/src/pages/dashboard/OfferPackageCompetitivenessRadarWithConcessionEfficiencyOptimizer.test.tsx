import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OfferPackageCompetitivenessRadarWithConcessionEfficiencyOptimizer from './OfferPackageCompetitivenessRadarWithConcessionEfficiencyOptimizer';

describe('OfferPackageCompetitivenessRadarWithConcessionEfficiencyOptimizer', () => {
  it('renders the radar title', () => {
    render(<OfferPackageCompetitivenessRadarWithConcessionEfficiencyOptimizer />);
    expect(screen.getByText('Offer Package Competitiveness Radar')).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<OfferPackageCompetitivenessRadarWithConcessionEfficiencyOptimizer />);
    expect(screen.getByText('Optimize concessions efficiently.')).toBeInTheDocument();
  });
});
