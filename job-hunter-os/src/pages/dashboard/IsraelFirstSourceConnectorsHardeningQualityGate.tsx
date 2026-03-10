import React, { useMemo, useState } from 'react';

type SourceStatus = 'healthy' | 'degraded' | 'down';

type ConnectorRecord = {
  id: string;
  source: string;
  region: 'israel' | 'global';
  status: SourceStatus;
  latencyMs: number;
  successRate: number;
  parsedJobs: number;
  uniqueJobs: number;
  qualityScore: number;
  lastError?: string;
  partial?: boolean;
};

type Props = {
  data?: ConnectorRecord[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const statusColor: Record<SourceStatus, string> = {
  healthy: '#15803d',
  degraded: '#b45309',
  down: '#b91c1c',
};

export const IsraelFirstSourceConnectorsHardeningQualityGate: React.FC<Props> = ({ data = [], loading = false, error = null, onRetry }) => {
  const [regionFilter, setRegionFilter] = useState<'all' | 'israel' | 'global'>('israel');
  const [qualityThreshold, setQualityThreshold] = useState(70);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => {
    return data
      .filter((r) => (regionFilter === 'all' ? true : r.region === regionFilter))
      .map((r) => ({ ...r, dedupeRate: r.parsedJobs > 0 ? Math.round((1 - r.uniqueJobs / r.parsedJobs) * 100) : 0 }))
      .sort((a, b) => a.qualityScore - b.qualityScore);
  }, [data, regionFilter]);

  const gated = rows.filter((r) => r.qualityScore >= qualityThreshold && r.status !== 'down');
  const blocked = rows.filter((r) => !(r.qualityScore >= qualityThreshold && r.status !== 'down'));
  const selected = rows.find((r) => r.id === selectedId) ?? rows[0] ?? null;

  if (loading) return <section aria-busy='true' style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Israel-First Connectors Hardening</h3><p style={{ color: '#6b7280' }}>Loading connector telemetry…</p></section>;
  if (error) return <section role='alert' style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 12, padding: 16 }}><h3 style={{ margin: 0, color: '#991b1b' }}>Connector hardening unavailable</h3><p style={{ color: '#7f1d1d' }}>{error}</p><button onClick={onRetry}>Retry</button></section>;
  if (!data.length) return <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Israel-First Connectors Hardening</h3><p style={{ color: '#6b7280' }}>No connector data loaded.</p></section>;

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Israel-First Source Connectors + Quality Gate</h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>Harden ingestion reliability and block low-quality shortlist ingress.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value as 'all' | 'israel' | 'global')}>
            <option value='israel'>Israel only</option>
            <option value='all'>All regions</option>
            <option value='global'>Global only</option>
          </select>
          <label style={{ fontSize: 12 }}>
            Gate ({qualityThreshold})
            <input type='range' min={50} max={95} value={qualityThreshold} onChange={(e) => setQualityThreshold(Number(e.target.value))} />
          </label>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px 10px' }}>Source</th>
                <th style={{ textAlign: 'left', padding: '8px 10px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '8px 10px' }}>Quality</th>
                <th style={{ textAlign: 'left', padding: '8px 10px' }}>Dedupe</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} onClick={() => setSelectedId(r.id)} style={{ borderTop: '1px solid #e5e7eb', cursor: 'pointer', background: selectedId === r.id ? '#eff6ff' : '#fff' }}>
                  <td style={{ padding: '8px 10px' }}>{r.source}</td>
                  <td style={{ padding: '8px 10px' }}><span style={{ color: statusColor[r.status], fontWeight: 600 }}>{r.status}</span></td>
                  <td style={{ padding: '8px 10px' }}>{r.qualityScore}</td>
                  <td style={{ padding: '8px 10px' }}>{r.dedupeRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#f8fafc' }}>
          <h3 style={{ marginTop: 0, fontSize: 14 }}>Quality Gate Outcome</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>Pass: {gated.length}</span>
            <span style={{ background: '#fee2e2', color: '#991b1b', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>Blocked: {blocked.length}</span>
          </div>
          {selected ? (
            <div style={{ fontSize: 12, color: '#374151', display: 'grid', gap: 6 }}>
              <div><strong>Source:</strong> {selected.source}</div>
              <div><strong>Latency:</strong> {selected.latencyMs}ms</div>
              <div><strong>Success rate:</strong> {selected.successRate}%</div>
              <div><strong>Parsed / Unique:</strong> {selected.parsedJobs} / {selected.uniqueJobs}</div>
              <div><strong>Gate decision:</strong> {selected.qualityScore >= qualityThreshold && selected.status !== 'down' ? 'PASS' : 'BLOCK'}</div>
              {selected.lastError && <div><strong>Last error:</strong> {selected.lastError}</div>}
              {selected.partial && <div style={{ color: '#9a3412' }}>Partial telemetry</div>}
            </div>
          ) : <p style={{ color: '#6b7280', fontSize: 12 }}>Select a source for drill-down.</p>}
        </aside>
      </div>
    </section>
  );
};
