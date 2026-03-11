import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PipelineHandoffReadinessChecklistDrawer } from './PipelineHandoffReadinessChecklistDrawer';

describe('PipelineHandoffReadinessChecklistDrawer', () => {
  afterEach(() => cleanup());

  it('C1: blocks submit when required-field gate is incomplete', async () => {
    render(<PipelineHandoffReadinessChecklistDrawer />);
    fireEvent.click(screen.getByLabelText('Submit Handoff Checklist'));
    expect(screen.getByText('Resolve required fields, interview notes, and blockers before handoff.')).toBeInTheDocument();
  });

  it('C2: checkbox toggles work for all checklist gates', () => {
    render(<PipelineHandoffReadinessChecklistDrawer />);
    const required = screen.getByLabelText('Required fields complete') as HTMLInputElement;
    const notes = screen.getByLabelText('Interview notes attached') as HTMLInputElement;
    const blockers = screen.getByLabelText('Blockers resolved') as HTMLInputElement;

    fireEvent.click(required);
    fireEvent.click(notes);
    fireEvent.click(blockers);

    expect(required.checked).toBe(true);
    expect(notes.checked).toBe(true);
    expect(blockers.checked).toBe(true);
  });

  it('C3: Esc closes drawer', () => {
    render(<PipelineHandoffReadinessChecklistDrawer />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Open Handoff Drawer')).toBeInTheDocument();
  });

  it('C4: Cmd/Ctrl + Enter submits when checklist is ready', async () => {
    render(<PipelineHandoffReadinessChecklistDrawer />);
    fireEvent.click(screen.getByLabelText('Required fields complete'));
    fireEvent.click(screen.getByLabelText('Interview notes attached'));
    fireEvent.click(screen.getByLabelText('Blockers resolved'));

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Enter', ctrlKey: true });

    expect(await screen.findByText('Handoff checklist submitted successfully.')).toBeInTheDocument();
  });

  it('C5: pending state is shown while submitting', () => {
    render(<PipelineHandoffReadinessChecklistDrawer />);
    fireEvent.click(screen.getByLabelText('Required fields complete'));
    fireEvent.click(screen.getByLabelText('Interview notes attached'));
    fireEvent.click(screen.getByLabelText('Blockers resolved'));
    fireEvent.click(screen.getByLabelText('Submit Handoff Checklist'));

    expect(screen.getByText('Submitting handoff checklist...')).toBeInTheDocument();
  });

  it('C6: success state appears after valid submit', async () => {
    render(<PipelineHandoffReadinessChecklistDrawer />);
    fireEvent.click(screen.getByLabelText('Required fields complete'));
    fireEvent.click(screen.getByLabelText('Interview notes attached'));
    fireEvent.click(screen.getByLabelText('Blockers resolved'));
    fireEvent.click(screen.getByLabelText('Submit Handoff Checklist'));

    expect(await screen.findByText('Handoff checklist submitted successfully.')).toBeInTheDocument();
  });

  it('C7: error state appears when submit fails', async () => {
    render(<PipelineHandoffReadinessChecklistDrawer simulateError />);
    fireEvent.click(screen.getByLabelText('Required fields complete'));
    fireEvent.click(screen.getByLabelText('Interview notes attached'));
    fireEvent.click(screen.getByLabelText('Blockers resolved'));
    fireEvent.click(screen.getByLabelText('Submit Handoff Checklist'));

    expect(await screen.findByText('Handoff submission failed. Retry in a moment.')).toBeInTheDocument();
  });

  it('C8: can reopen drawer after close action', () => {
    render(<PipelineHandoffReadinessChecklistDrawer />);
    fireEvent.click(screen.getByLabelText('Close Handoff Drawer'));
    fireEvent.click(screen.getByLabelText('Open Handoff Drawer'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
