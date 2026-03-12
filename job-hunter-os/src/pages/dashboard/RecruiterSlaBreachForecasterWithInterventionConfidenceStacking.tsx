import React from 'react';

type Forecast = { id: string; recruiter: string; breachRisk: number; intervention: string; confidence: number };
type Props = { loading?: boolean; error?: string | null; data?: Forecast[] };

const defaultData: Forecast[] = [
  { id: 'f1', recruiter: 'Dana', breachRisk: 72, intervention: 'priority queue rebalance', confidence: 0.68 },
  { id: 'f2', recruiter: 'Eli', breachRisk: 58, intervention: 'follow-up automation nudge', confidence: 0.74 },
];

export const RecruiterSlaBreachForecasterWithInterventionConfidenceStacking: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  if (loading) return <p>Loading recruiter SLA forecaster...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No SLA breach forecasts available.</p>;

  return (
    <section>
      <h3>Recruiter SLA Breach Forecaster</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {data.map((item) => (
          <article key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
            <strong>{item.recruiter}</strong>
            <div>Forecast breach risk: {item.breachRisk}%</div>
            <div>Intervention: {item.intervention}</div>
            <div>Confidence stack: {(item.confidence * 100).toFixed(0)}%</div>
          </article>
        ))}
      </div>
    </section>
  );
};
