import React, { useMemo } from 'react';
import { useTelemetry } from '../../providers/TelemetryProvider';

type Props = {
  localModules?: { module: string; localErrorRate: number; fallbackActive: boolean }[];
};

export const DashboardErrorTelemetryUnificationPanel: React.FC<Props> = ({ localModules = [] }) => {
  const { connected, error, metrics, lastUpdated } = useTelemetry();

  const unified = useMemo(() => {
    return localModules.map((m) => {
      const remoteRate = Number(metrics?.[m.module]?.errorRate ?? 0);
      const total = Number(((m.localErrorRate + remoteRate) / 2).toFixed(1));
      return { ...m, remoteRate, total };
    }).sort((a, b) => b.total - a.total);
  }, [localModules, metrics]);

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Dashboard Error Telemetry Unification</h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>Combines local UI fault signals with live telemetry to prioritize hardening actions.</p>
        </div>
        <div style={{ fontSize: 12, color: connected ? '#166534' : '#991b1b' }}>
          {connected ? 'Telemetry connected' : 'Telemetry degraded'}
          {lastUpdated && <div>Updated {new Date(lastUpdated).toLocaleTimeString()}</div>}
        </div>
      </header>

      {error && (
        <div style={{ marginBottom: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 8, padding: 8, fontSize: 12 }}>
          Live telemetry error: {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {unified.map((u) => (
          <div key={u.module} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, background: '#f9fafb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{u.module}</strong>
              <span style={{ fontSize: 12, color: u.total >= 10 ? '#b91c1c' : '#166534' }}>Unified error rate {u.total}%</span>
            </div>
            <div style={{ fontSize: 12, color: '#4b5563', marginTop: 4 }}>
              Local {u.localErrorRate}% · Remote {u.remoteRate}% · Fallback {u.fallbackActive ? 'active' : 'inactive'}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
