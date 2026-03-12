import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MatchShortlistActionRail } from './MatchShortlistActionRail';

describe('MatchShortlistActionRail', () => {
  it('updates candidate status via action rail', () => {
    render(<MatchShortlistActionRail />);
    fireEvent.click(screen.getAllByText('Reject')[0]);
    expect(screen.getByText(/Noa Levi .* rejected/)).toBeInTheDocument();
  });
});
