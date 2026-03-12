import React from 'react';

type Conflict = { id: string; panel: string; conflict: string; slaRisk: 'low' | 'medium' | 'high'; swapPlan: string };
type Props = { loading?: boolean; error?: string | null; data?: Conflict[] };

const defaultData: Conflict[] = [
  { id: 'p1', panel: 'Backend Panel A', conflict: 'Interviewer overlap', slaRisk: 'high', swapPlan: 'Swap with Panel C at 14:00' },
  { id: 'p2', panel: 'Product Panel B', conflict: 'Room conflict', slaRisk: 'medium', swapPlan: 'Move to Zoom fallback lane' },
];

export const PanelSchedulingConflictResolutionBoardWithSlaPreservingSwapEngine: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  if (loading) return <p>Loading scheduling conflict board...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No panel scheduling conflicts detected.</p>;

  return (
    <section>
      <h3>Panel Scheduling Conflict Resolution Board</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {data.map((item) => (
          <article key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
            <strong>{item.panel}</strong>
            <div>Conflict: {item.conflict}</div>
            <div>SLA risk: {item.slaRisk}</div>
            <div>Swap engine plan: {item.swapPlan}</div>
          </article>
        ))}
      </div>
    </section>
  );
};
