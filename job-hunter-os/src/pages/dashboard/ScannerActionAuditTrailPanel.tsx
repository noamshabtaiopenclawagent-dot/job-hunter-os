import React, { useMemo, useState } from 'react';

type Log = { id: string; action: 'retry' | 'pause' | 'resume' | 'diagnostics_opened'; timestamp: string; actor: 'recruiter' | 'coordinator' | 'manager'; source: 'linkedin' | 'referral' | 'agency'; result: 'success' | 'error'; details: string };

type Props = { loading?: boolean; error?: string | null; logs?: Log[] };

export const ScannerActionAuditTrailPanel: React.FC<Props> = ({
  loading = false,
  error = null,
  logs = [
    { id: 'l1', action: 'retry', timestamp: '2026-03-11T12:30:00Z', actor: 'recruiter', source: 'linkedin', result: 'success', details: 'Retry all queued' },
    { id: 'l2', action: 'pause', timestamp: '2026-03-11T12:31:00Z', actor: 'coordinator', source: 'agency', result: 'success', details: 'Paused source' },
    { id: 'l3', action: 'diagnostics_opened', timestamp: '2026-03-11T12:33:00Z', actor: 'manager', source: 'referral', result: 'error', details: 'Diagnostics timeout' },
  ],
}) => {
  const [role, setRole] = useState<'all' | Log['actor']>('all');
  const [source, setSource] = useState<'all' | Log['source']>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => logs
    .filter((l) => role === 'all' || l.actor === role)
    .filter((l) => source === 'all' || l.source === source), [logs, role, source]);

  if (loading) return <p>Loading audit trail…</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!filtered.length) return <p>No audit logs found.</p>;

  return (
    <section>
      <h3>Scanner Action Audit Trail Panel</h3>
      <label>Role<select aria-label="Role filter" value={role} onChange={(e) => setRole(e.target.value as any)}><option value="all">All</option><option value="recruiter">Recruiter</option><option value="coordinator">Coordinator</option><option value="manager">Manager</option></select></label>
      <label>Source<select aria-label="Source filter" value={source} onChange={(e) => setSource(e.target.value as any)}><option value="all">All</option><option value="linkedin">LinkedIn</option><option value="referral">Referral</option><option value="agency">Agency</option></select></label>
      <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
        {filtered.map((l) => (
          <article key={l.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 10 }}>
            <button onClick={() => setExpanded((v) => v === l.id ? null : l.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              {l.action} • <span>{new Date(l.timestamp).toLocaleTimeString()}</span> • <span>{l.actor}</span> • <span>{l.source}</span> • <span>{l.result}</span>
            </button>
            {expanded === l.id && <p data-testid="audit-details">{l.details}</p>}
          </article>
        ))}
      </div>
    </section>
  );
};
