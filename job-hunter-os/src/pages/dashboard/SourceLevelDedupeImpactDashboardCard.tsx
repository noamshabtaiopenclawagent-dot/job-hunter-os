import React from 'react';

type Row = { source: string; before: number; after: number };

type Props = { rows?: Row[] };

export const SourceLevelDedupeImpactDashboardCard: React.FC<Props> = ({
  rows = [
    { source: 'AllJobs IL', before: 420, after: 310 },
    { source: 'LinkedIn ISR', before: 510, after: 402 },
    { source: 'Drushim', before: 260, after: 215 },
  ],
}) => {
  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>Source-level Dedupe Impact</h3>
      {rows.map((r) => {
        const saved = r.before - r.after;
        const pct = r.before ? Math.round((saved / r.before) * 100) : 0;
        return (
          <div key={r.source} style={{ marginBottom: 8 }}>
            <strong>{r.source}</strong>
            <div>Before: {r.before} • After: {r.after} • Reduced: {saved} ({pct}%)</div>
          </div>
        );
      })}
    </section>
  );
};
