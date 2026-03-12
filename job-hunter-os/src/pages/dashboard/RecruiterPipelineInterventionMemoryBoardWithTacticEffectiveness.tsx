import React from 'react';

type Tactic = { id: string; tactic: string; stage: string; successRate: number; lastUsed: string };

type Props = { loading?: boolean; error?: string | null; data?: Tactic[] };

const defaultData: Tactic[] = [
  { id: 't1', tactic: '24h follow-up cadence', stage: 'Interview', successRate: 0.68, lastUsed: '2026-03-10' },
  { id: 't2', tactic: 'Comp-band pre-alignment', stage: 'Offer', successRate: 0.74, lastUsed: '2026-03-11' },
];

export const RecruiterPipelineInterventionMemoryBoardWithTacticEffectiveness: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  if (loading) return <p>Loading intervention memory board...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No intervention memory entries available.</p>;

  return (
    <section>
      <h3>Recruiter Pipeline Intervention Memory Board</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {data.map((item) => (
          <article key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
            <strong>{item.tactic}</strong>
            <div>Stage: {item.stage}</div>
            <div>Effectiveness: {(item.successRate * 100).toFixed(0)}%</div>
            <div>Last used: {item.lastUsed}</div>
          </article>
        ))}
      </div>
    </section>
  );
};
