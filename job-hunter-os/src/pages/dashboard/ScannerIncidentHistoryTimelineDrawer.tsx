import React, { useMemo, useState } from 'react';

type Incident = { id: string; at: string; source: string; severity: 'critical' | 'high' | 'medium'; status: 'open' | 'resolved'; summary: string };

type Props = { incidents?: Incident[] };

export const ScannerIncidentHistoryTimelineDrawer: React.FC<Props> = ({
  incidents = [
    { id: 'i1', at: '2026-03-11T10:20:00Z', source: 'AllJobs IL', severity: 'high', status: 'resolved', summary: 'Rate limit spikes' },
    { id: 'i2', at: '2026-03-11T10:52:00Z', source: 'LinkedIn ISR', severity: 'critical', status: 'open', summary: 'Auth token rejected' },
    { id: 'i3', at: '2026-03-11T11:06:00Z', source: 'Drushim', severity: 'medium', status: 'resolved', summary: 'Transient parser timeout' },
  ],
}) => {
  const [open, setOpen] = useState(true);
  const [filter, setFilter] = useState<'all' | Incident['status']>('all');

  const rows = useMemo(
    () => incidents.filter((i) => filter === 'all' || i.status === filter).sort((a, b) => (a.at < b.at ? 1 : -1)),
    [incidents, filter],
  );

  if (!open) return <button onClick={() => setOpen(true)}>Open incident history</button>;

  return (
    <aside style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Scanner Incident History Timeline</h3>
        <button onClick={() => setOpen(false)}>Close</button>
      </div>
      <label>
        Status filter
        <select aria-label="Status filter" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
        </select>
      </label>
      <ul style={{ marginTop: 10, paddingLeft: 18 }}>
        {rows.map((r) => (
          <li key={r.id} title={`${r.source} • ${r.severity}`}>
            <strong>{new Date(r.at).toLocaleTimeString()}</strong> — {r.summary} ({r.status})
          </li>
        ))}
      </ul>
    </aside>
  );
};
