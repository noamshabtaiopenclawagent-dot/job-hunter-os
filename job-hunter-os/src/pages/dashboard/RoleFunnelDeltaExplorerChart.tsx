import React, { useMemo, useState } from 'react';

type Point = { role: 'recruiter' | 'coordinator' | 'manager'; applied: number; interview: number; offer: number };

type Props = { data?: Point[] };

export const RoleFunnelDeltaExplorerChart: React.FC<Props> = ({
  data = [
    { role: 'recruiter', applied: 240, interview: 120, offer: 48 },
    { role: 'coordinator', applied: 180, interview: 90, offer: 36 },
    { role: 'manager', applied: 150, interview: 84, offer: 42 },
  ],
}) => {
  const [baseline, setBaseline] = useState<'recruiter' | 'coordinator' | 'manager'>('recruiter');

  const base = data.find((d) => d.role === baseline) ?? data[0];
  const rows = useMemo(
    () => data.map((d) => ({ ...d, deltaInterview: d.interview - base.interview, deltaOffer: d.offer - base.offer })),
    [data, base],
  );

  return (
    <section>
      <h3>Role Funnel Delta Explorer Chart</h3>
      <label>
        Baseline role
        <select aria-label="Baseline role" value={baseline} onChange={(e) => setBaseline(e.target.value as any)}>
          <option value="recruiter">Recruiter</option>
          <option value="coordinator">Coordinator</option>
          <option value="manager">Manager</option>
        </select>
      </label>
      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        {rows.map((r) => (
          <div key={r.role} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 10 }}>
            <strong>{r.role}</strong>
            <div>Applied: {r.applied} • Interview: {r.interview} • Offer: {r.offer}</div>
            <div>Δ Interview vs baseline: {r.deltaInterview}</div>
            <div>Δ Offer vs baseline: {r.deltaOffer}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
