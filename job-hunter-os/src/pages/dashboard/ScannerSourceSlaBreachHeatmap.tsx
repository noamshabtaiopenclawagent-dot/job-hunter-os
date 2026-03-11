import React, { useMemo, useState } from 'react';

type Severity = 'low' | 'medium' | 'high';
type HeatmapCell = {
  source: string;
  role: string;
  hour: string;
  breaches: number;
  severity: Severity;
  incidentId: string;
};

type Props = {
  loading?: boolean;
  error?: string | null;
  compact?: boolean;
  data?: HeatmapCell[];
};

const defaultData: HeatmapCell[] = [
  { source: 'AllJobs IL', role: 'recruiter', hour: '09:00', breaches: 1, severity: 'low', incidentId: 'inc-101' },
  { source: 'AllJobs IL', role: 'recruiter', hour: '10:00', breaches: 3, severity: 'medium', incidentId: 'inc-102' },
  { source: 'LinkedIn ISR', role: 'analyst', hour: '09:00', breaches: 5, severity: 'high', incidentId: 'inc-103' },
  { source: 'Drushim', role: 'recruiter', hour: '10:00', breaches: 2, severity: 'medium', incidentId: 'inc-104' },
];

const severityColor: Record<Severity, string> = {
  low: '#dcfce7',
  medium: '#fef3c7',
  high: '#fecaca',
};

export const ScannerSourceSlaBreachHeatmap: React.FC<Props> = ({
  loading = false,
  error = null,
  compact = false,
  data = defaultData,
}) => {
  const [roleFilter, setRoleFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);

  const roles = useMemo(() => Array.from(new Set(data.map((d) => d.role))), [data]);
  const sources = useMemo(() => Array.from(new Set(data.map((d) => d.source))), [data]);

  const filtered = useMemo(
    () =>
      data.filter(
        (d) => (roleFilter === 'all' || d.role === roleFilter) && (sourceFilter === 'all' || d.source === sourceFilter),
      ),
    [data, roleFilter, sourceFilter],
  );

  if (loading) return <p>Loading SLA breach heatmap...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No SLA breach records found.</p>;

  return (
    <section>
      <h3>Scanner Source SLA Breach Heatmap</h3>
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <label>
          Role Filter
          <select aria-label="Role Filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All</option>
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>
        <label>
          Source Filter
          <select aria-label="Source Filter" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            <option value="all">All</option>
            {sources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: compact ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gap: 8 }}>
        {filtered.map((cell) => (
          <button
            key={`${cell.source}-${cell.hour}-${cell.incidentId}`}
            title={`${cell.source} ${cell.hour} • ${cell.breaches} breaches • ${cell.severity}`}
            onClick={() => setSelectedIncident(cell.incidentId)}
            style={{
              border: '1px solid #d1d5db',
              background: severityColor[cell.severity],
              borderRadius: 8,
              padding: 10,
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <strong>{cell.source}</strong>
            <div>{cell.hour}</div>
            <div>{cell.breaches} breaches</div>
          </button>
        ))}
      </div>

      {selectedIncident && (
        <div role="status" style={{ marginTop: 12 }}>
          Incident drilldown opened: {selectedIncident}
        </div>
      )}
    </section>
  );
};
