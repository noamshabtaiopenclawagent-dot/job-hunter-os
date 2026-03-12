import React, { useMemo, useState } from 'react';

type NegotiationRisk = {
  id: string;
  candidate: string;
  concessionPct: number;
  marginalGainPct: number;
  budgetRisk: 'low' | 'medium' | 'high';
};

type Props = {
  loading?: boolean;
  error?: string | null;
  data?: NegotiationRisk[];
};

const defaultData: NegotiationRisk[] = [
  { id: 'n1', candidate: 'Noa Levi', concessionPct: 11, marginalGainPct: 2, budgetRisk: 'high' },
  { id: 'n2', candidate: 'Idan Bar', concessionPct: 6, marginalGainPct: 4, budgetRisk: 'medium' },
];

export const OfferNegotiationRiskGuardrailPanelWithConcessionStopLossAlert: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  const [slider, setSlider] = useState(10);

  const insights = useMemo(() => data.map((d) => ({ ...d, stopLoss: d.concessionPct >= slider })), [data, slider]);

  if (loading) return <p>Loading negotiation risk context...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No negotiation context available.</p>;

  return (
    <section>
      <h3>Offer Negotiation Risk Guardrail Panel</h3>
      <label>
        Stop-loss threshold (% concession)
        <input aria-label="Stop-loss threshold" type="range" min={5} max={20} value={slider} onChange={(e) => setSlider(Number(e.target.value))} />
      </label>
      <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
        {insights.map((item) => (
          <article key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }} title={`Budget risk ${item.budgetRisk}`}>
            <strong>{item.candidate}</strong>
            <div>Concession: {item.concessionPct}%</div>
            <div>Marginal gain: {item.marginalGainPct}%</div>
            <div>Budget risk: {item.budgetRisk}</div>
            <div>{item.stopLoss ? 'Stop-loss alert triggered' : 'Within guardrail'}</div>
          </article>
        ))}
      </div>
      <p style={{ marginTop: 8 }}>Safer path: prioritize non-cash concessions when stop-loss is triggered.</p>
    </section>
  );
};
