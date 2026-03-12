import React, { useMemo, useState } from 'react';

type Correlation = {
  id: string;
  primaryIncident: string;
  correlatedSignal: string;
  confidence: number;
  source: string;
  window: string;
};

type Props = {
  loading?: boolean;
  error?: string | null;
  data?: Correlation[];
};

const defaultData: Correlation[] = [
  { id: 'c1', primaryIncident: 'inc-901', correlatedSignal: 'crawl timeout spike', confidence: 0.89, source: 'AllJobs IL', window: '09:00-10:00' },
  { id: 'c2', primaryIncident: 'inc-902', correlatedSignal: 'auth token refresh failures', confidence: 0.93, source: 'LinkedIn ISR', window: '10:00-11:00' },
  { id: 'c3', primaryIncident: 'inc-903', correlatedSignal: 'parser schema mismatch', confidence: 0.78, source: 'Drushim', window: '11:00-12:00' },
];

export const ScannerIncidentCorrelationExplorerPanel: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);

  const sources = useMemo(() => Array.from(new Set(data.map((d) => d.source))), [data]);
  const filtered = useMemo(() => data.filter((d) => sourceFilter === 'all' || d.source === sourceFilter), [data, sourceFilter]);

  if (loading) return <p>Loading incident correlations...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No incident correlations detected.</p>;

  return (
    <section>
      <h3>Scanner Incident Correlation Explorer Panel</h3>
      <label>
        Source Filter
        <select aria-label="Correlation Source Filter" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
          <option value="all">All</option>
          {sources.map((source) => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
      </label>

      <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedIncident(item.primaryIncident)}
            title={`${item.primaryIncident} • ${item.correlatedSignal} • ${(item.confidence * 100).toFixed(0)}%`}
            style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, textAlign: 'left' }}
          >
            <strong>{item.primaryIncident}</strong>
            <div>{item.correlatedSignal}</div>
            <div>{item.source} • {item.window}</div>
            <div>Confidence {(item.confidence * 100).toFixed(0)}%</div>
          </button>
        ))}
      </div>

      {selectedIncident && <p style={{ marginTop: 10 }}>Opened correlation drilldown for {selectedIncident}.</p>}
    </section>
  );
};
