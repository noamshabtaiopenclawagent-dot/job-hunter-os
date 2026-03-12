import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ScannerSourcePauseResumeStatusRibbon } from './ScannerSourcePauseResumeStatusRibbon';

describe('ScannerSourcePauseResumeStatusRibbon', () => {
  it('toggles source pause/resume state', () => {
    render(<ScannerSourcePauseResumeStatusRibbon />);
    const btn = screen.getByText(/AllJobs IL: Running/);
    fireEvent.click(btn);
    expect(screen.getByText(/AllJobs IL: Paused/)).toBeInTheDocument();
  });
});
