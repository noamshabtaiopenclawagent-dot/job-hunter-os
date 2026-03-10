import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardErrorTelemetryUnificationPanel } from './DashboardErrorTelemetryUnificationPanel';
import { TelemetryProvider } from '../../providers/TelemetryProvider';

describe('DashboardErrorTelemetryUnificationPanel', () => {
  it('renders unified error panel with module rows', () => {
    render(
      <TelemetryProvider endpointUrl="http://localhost:0/unavailable" pollIntervalMs={999999}>
        <DashboardErrorTelemetryUnificationPanel localModules={[
          { module: 'Org Tree UX Hardening', localErrorRate: 12, fallbackActive: true },
          { module: 'Dashboard Actionability', localErrorRate: 6, fallbackActive: false },
        ]} />
      </TelemetryProvider>,
    );

    expect(screen.getByText('Dashboard Error Telemetry Unification')).toBeInTheDocument();
    expect(screen.getByText(/Org Tree UX Hardening/)).toBeInTheDocument();
    expect(screen.getByText(/Unified error rate/)).toBeInTheDocument();
  });
});
