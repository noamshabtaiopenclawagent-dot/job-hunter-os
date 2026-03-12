import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CandidateTimelineEventComposer } from './CandidateTimelineEventComposer';

describe('CandidateTimelineEventComposer', () => {
  it('validates input and supports ctrl/cmd+enter submit with transitions', async () => {
    render(<CandidateTimelineEventComposer />);
    fireEvent.click(screen.getByText('Add Event'));
    expect(screen.getByText('Event text is required')).toBeInTheDocument();

    const input = screen.getByLabelText('Event input');
    fireEvent.change(input, { target: { value: 'Interview feedback received' } });
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });

    expect(screen.getByText(/pending/)).toBeInTheDocument();
    await vi.waitFor(() => expect(screen.getByText(/success/)).toBeInTheDocument());
  });
});
