import React, { useMemo, useState } from 'react';

type Role = 'recruiter' | 'coordinator' | 'manager';
type Stage = 'applied' | 'screen' | 'interview' | 'offer';

type RoleData = { role: Role; throughput: Record<Stage, number> };

type Props = { data?: RoleData[]; loading?: boolean; error?: string | null };

const stages: Stage[] = ['applied', 'screen', 'interview', 'offer'];

export const CrossRoleStageThroughputComparisonBoard: React.FC<Props> = ({
  data = [
    { role: 'recruiter', throughput: { applied: 220, screen: 145, interview: 88, offer: 34 } },
    { role: 'coordinator', throughput: { applied: 210, screen: 132, interview: 79, offer: 30 } },
    { role: 'manager', throughput: { applied: 190, screen: 126, interview: 81, offer: 36 } },
  ],
  loading = false,
  error = null,
}) => {
  const [baseline, setBaseline] = useState<Role>('recruiter');
  const [openStage, setOpenStage] = useState<Stage | null>(null);

  const baselineData = data.find((d) => d.role === baseline) ?? data[0];
  const cards = useMemo(() => data.map((d) => ({
    ...d,
    delta: Object.fromEntries(stages.map((s) => [s, d.throughput[s] - baselineData.throughput[s]])) as Record<Stage, number>,
  })), [data, baselineData]);

  if (loading) return <p>Loading throughput board…</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No throughput data available.</p>;

  return (
    <section>
      <h3>Cross-role Stage Throughput Comparison Board</h3>
      <label>
        Baseline role
        <select aria-label="Baseline role" value={baseline} onChange={(e) => setBaseline(e.target.value as Role)}>
          <option value="recruiter">Recruiter</option>
          <option value="coordinator">Coordinator</option>
          <option value="manager">Manager</option>
        </select>
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10, marginTop: 10 }}>
        {cards.map((c) => (
          <article key={c.role} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 10, transition: 'all 160ms ease' }}>
            <strong>{c.role}</strong>
            {stages.map((s) => (
              <div key={s}>
                <button onClick={() => setOpenStage((v) => (v === s ? null : s))} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                  {s}: {c.throughput[s]} <span style={{ borderRadius: 999, padding: '1px 6px', background: '#eef2ff' }}>Δ {c.delta[s]}</span>
                </button>
              </div>
            ))}
          </article>
        ))}
      </div>
      {openStage && <p data-testid="stage-drilldown">Drilldown: {openStage}</p>}
    </section>
  );
};
