import React from 'react';

type IntentRow = { id: string; candidate: string; volatility: number; bestInterventionWindow: string; risk: 'low' | 'medium' | 'high' };
type Props = { loading?: boolean; error?: string | null; data?: IntentRow[] };

const defaultData: IntentRow[] = [
  { id: 'i1', candidate: 'Noa Levi', volatility: 67, bestInterventionWindow: 'Next 6h', risk: 'high' },
  { id: 'i2', candidate: 'Idan Bar', volatility: 39, bestInterventionWindow: 'Next 24h', risk: 'medium' },
];

export const CandidateIntentVolatilityTrackerWithInterventionTimingPredictor: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  if (loading) return <p>Loading intent volatility tracker...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No candidate intent volatility records available.</p>;

  return (
    <section>
      <h3>Candidate Intent Volatility Tracker</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {data.map((row) => (
          <article key={row.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
            <strong>{row.candidate}</strong>
            <div>Volatility score: {row.volatility}</div>
            <div>Intervention window: {row.bestInterventionWindow}</div>
            <div>Risk: {row.risk}</div>
          </article>
        ))}
      </div>
    </section>
  );
};
