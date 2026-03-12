import React from 'react';

type Panel = { id: string; panel: string; biasDrift: number; intervention: string };
type Props = { loading?: boolean; error?: string | null; data?: Panel[] };

const defaultData: Panel[] = [
  { id: 'p1', panel: 'Backend Loop', biasDrift: 14, intervention: 'Add calibrated reviewer' },
  { id: 'p2', panel: 'Product Loop', biasDrift: 6, intervention: 'Run scorecard refresh' },
];

export const InterviewPanelFairnessBalancerWithBiasDriftInterventionPlanner: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  if (loading) return <p>Loading panel fairness balancer...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No panel fairness records available.</p>;

  return (
    <section>
      <h3>Interview Panel Fairness Balancer</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {data.map((item) => (
          <article key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
            <strong>{item.panel}</strong>
            <div>Bias drift: {item.biasDrift}%</div>
            <div>Intervention plan: {item.intervention}</div>
          </article>
        ))}
      </div>
    </section>
  );
};
