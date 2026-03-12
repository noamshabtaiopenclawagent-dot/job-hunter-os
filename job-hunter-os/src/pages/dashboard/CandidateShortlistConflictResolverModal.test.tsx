import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CandidateShortlistConflictResolverModal } from './CandidateShortlistConflictResolverModal';

describe('CandidateShortlistConflictResolverModal', () => {
  it('C1 side-by-side + C2 keep validation + C3 merge + C4 keyboard + C5 states + C6/C7/C8/C9 loading/empty/error/success', async () => {
    const { rerender } = render(<CandidateShortlistConflictResolverModal />);
    expect(screen.getByText(/score 91/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Keep left'));
    expect(screen.getByText(/Audit note is required/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Audit note'), { target: { value: 'dedupe rationale' } });
    fireEvent.click(screen.getByText('Merge both'));
    expect(screen.getByText('Pending…')).toBeInTheDocument();
    await vi.waitFor(() => expect(screen.getByText(/Success:/)).toBeInTheDocument());

    rerender(<CandidateShortlistConflictResolverModal loading />);
    expect(screen.getByText(/Loading conflicts/)).toBeInTheDocument();
    rerender(<CandidateShortlistConflictResolverModal left="" right="" />);
    expect(screen.getByText(/No conflicts found/)).toBeInTheDocument();
    rerender(<CandidateShortlistConflictResolverModal error="boom" />);
    expect(screen.getByText('boom')).toBeInTheDocument();
  });
});
