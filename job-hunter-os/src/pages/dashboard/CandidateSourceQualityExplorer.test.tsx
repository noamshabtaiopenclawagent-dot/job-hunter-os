import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CandidateSourceQualityExplorer } from './CandidateSourceQualityExplorer';

describe('CandidateSourceQualityExplorer Integration Test', () => {
  it('renders loading state then loads rows including source_origin', async () => {
    render(<CandidateSourceQualityExplorer />);
    
    // Check loading state
    expect(screen.getByRole('status')).toBeDefined();
    
    // Wait for the simulated fetch to complete
    await waitFor(() => {
      expect(screen.queryByRole('status')).toBeNull();
    });

    // Check that we render the table with the data
    expect(screen.getByText('Source Origin Quality Explorer')).toBeDefined();
    
    // Check for source_origin specific data
    expect(screen.getByText('https://remotive.com/api/remote-jobs?search=data+analyst')).toBeDefined();
    expect(screen.getByText('https://www.linkedin.com/jobs/search?keywords=product%20analyst&location=Israel')).toBeDefined();
    
    // Check for source tags
    expect(screen.getByText('remotive')).toBeDefined();
    expect(screen.getByText('linkedin')).toBeDefined();
  });
});
