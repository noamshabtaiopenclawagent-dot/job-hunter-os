import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('Job Hunter OS App Shell', () => {
  it('renders the global navigation shell and default dashboard view', () => {
    render(<App />);
    expect(screen.getByText('Job Hunter OS')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Job Hunter OS')).toBeInTheDocument();
  });

  it('renders the telemetry status indicator', () => {
    render(<App />);
    expect(screen.getByText(/Disconnected/i)).toBeInTheDocument();
  });
});
