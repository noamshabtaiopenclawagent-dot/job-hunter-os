import React from 'react';

type Cadence = { id: string; recruiter: string; touchpointsPerWeek: number; responseFatigueRisk: 'low' | 'medium' | 'high'; recommendation: string };
type Props = { loading?: boolean; error?: string | null; data?: Cadence[] };

const defaultData: Cadence[] = [
  { id: 'c1', recruiter: 'Dana', touchpointsPerWeek: 5, responseFatigueRisk: 'high', recommendation: 'Reduce to 3 and increase personalization' },
  { id: 'c2', recruiter: 'Eli', touchpointsPerWeek: 3, responseFatigueRisk: 'medium', recommendation: 'Keep cadence, alternate channel' },
];

export const RecruiterFollowUpCadenceOptimizerWithResponseFatigueGuardrails: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  if (loading) return <p>Loading follow-up cadence optimizer...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No cadence optimization records available.</p>;

  return (
    <section>
      <h3>Recruiter Follow-up Cadence Optimizer</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {data.map((item) => (
          <article key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
            <strong>{item.recruiter}</strong>
            <div>Touchpoints/week: {item.touchpointsPerWeek}</div>
            <div>Fatigue risk: {item.responseFatigueRisk}</div>
            <div>Recommendation: {item.recommendation}</div>
          </article>
        ))}
      </div>
    </section>
  );
};
