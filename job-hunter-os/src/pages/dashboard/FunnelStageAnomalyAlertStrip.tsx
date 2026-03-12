import React, { useMemo, useState } from 'react';

type Item = { id: string; role: 'recruiter' | 'coordinator' | 'manager'; source: 'linkedin' | 'referral' | 'agency'; stage: string; anomalyScore: number; note: string };

export const FunnelStageAnomalyAlertStrip: React.FC = () => {
  const [threshold, setThreshold] = useState(70);
  const [role, setRole] = useState<'all' | Item['role']>('all');
  const [source, setSource] = useState<'all' | Item['source']>('all');
  const [snoozed, setSnoozed] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [drilldown, setDrilldown] = useState<Item | null>(null);

  const data: Item[] = [
    { id: 'a1', role: 'recruiter', source: 'linkedin', stage: 'screen', anomalyScore: 81, note: 'Drop-off spike' },
    { id: 'a2', role: 'coordinator', source: 'agency', stage: 'interview', anomalyScore: 74, note: 'Latency regression' },
    { id: 'a3', role: 'manager', source: 'referral', stage: 'offer', anomalyScore: 62, note: 'Conversion dip' },
  ];

  const items = useMemo(() => data.filter((d) => d.anomalyScore >= threshold)
    .filter((d) => role === 'all' || d.role === role)
    .filter((d) => source === 'all' || d.source === source)
    .filter((d) => !snoozed.includes(d.id) && !dismissed.includes(d.id)), [threshold, role, source, snoozed, dismissed]);

  return (
    <section>
      <h3>Funnel Stage Anomaly Alert Strip</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <label>Threshold<input aria-label="Threshold" type="number" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} /></label>
        <label>Role<select aria-label="Role" value={role} onChange={(e) => setRole(e.target.value as any)}><option value="all">All</option><option value="recruiter">Recruiter</option><option value="coordinator">Coordinator</option><option value="manager">Manager</option></select></label>
        <label>Source<select aria-label="Source" value={source} onChange={(e) => setSource(e.target.value as any)}><option value="all">All</option><option value="linkedin">LinkedIn</option><option value="referral">Referral</option><option value="agency">Agency</option></select></label>
      </div>
      <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
        {items.map((i) => (
          <div key={i.id} style={{ border: '1px solid #e5e7eb', borderRadius: 999, padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setDrilldown(i)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{i.stage} • {i.anomalyScore}</button>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setSnoozed((p) => [...p, i.id])}>Snooze</button>
              <button onClick={() => setDismissed((p) => [...p, i.id])}>Dismiss</button>
            </div>
          </div>
        ))}
      </div>
      {drilldown && <p data-testid="drilldown">{drilldown.note}</p>}
    </section>
  );
};
