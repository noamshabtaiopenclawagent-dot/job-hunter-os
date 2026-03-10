import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { RoadmapShippedArtifactsMappingBoard } from './RoadmapShippedArtifactsMappingBoard';

describe('RoadmapShippedArtifactsMappingBoard', () => {
  const items = [
    {
      id: '1',
      name: 'Offer Canvas',
      path: '/src/pages/offer/OfferDecisionCollaborationCanvasWithConsensusSignals.tsx',
      stage: 'phase-0' as const,
      status: 'ready_reuse' as const,
      integrationDelta: 'Integrated in nav',
      kpiProof: 'Committed',
      reusableOutputs: ['Consensus model'],
    },
  ];

  it('renders empty state', () => {
    render(<RoadmapShippedArtifactsMappingBoard items={[]} />);
    expect(screen.getByText('No shipped artifact mappings found.')).toBeInTheDocument();
  });

  it('renders contract view for selected artifact', () => {
    render(<RoadmapShippedArtifactsMappingBoard items={items} />);
    expect(screen.getByText(/Execution Contract View/)).toBeInTheDocument();
    expect(screen.getByText(/Offer Canvas/)).toBeInTheDocument();
  });

  it('supports phase filtering', () => {
    render(<RoadmapShippedArtifactsMappingBoard items={items} />);
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'phase-1' } });
    expect(screen.getByText(/No artifacts in this phase/)).toBeInTheDocument();
  });
});
