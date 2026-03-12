import React, { useMemo, useState } from 'react';

type RiskLevel = 'low' | 'medium' | 'high';

type PolicyRiskEvent = {
  id: string;
  title: string;
  domain: 'privacy' | 'labor' | 'ai_policy' | 'immigration' | 'tax';
  jurisdiction: string;
  publishedAt: string;
  risk: RiskLevel;
  impactSummary: string;
};

type Props = {
  stream?: PolicyRiskEvent[];
};

const riskWeight: Record<RiskLevel, number> = { low: 1, medium: 2, high: 3 };

export const PolicyRiskWatchStream: React.FC<Props> = ({ stream = [] }) => {
  const [minRisk, setMinRisk] = useState<RiskLevel>('low');

  const filtered = useMemo(() => {
    const threshold = riskWeight[minRisk];
    return stream.filter((event) => riskWeight[event.risk] >= threshold);
  }, [stream, minRisk]);

  if (!stream.length) {
    return (
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}>
        <h3 style={{ margin: 0 }}>[UC2] Policy/Risk Watch Stream</h3>
        <p style={{ color: '#6b7280' }}>No policy/risk events ingested yet.</p>
      </section>
    );
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>[UC2] Policy/Risk Watch Stream</h3>
        <label style={{ fontSize: 13 }}>
          Min risk:{' '}
          <select value={minRisk} onChange={(e) => setMinRisk(e.target.value as RiskLevel)}>
            <option value='low'>Low</option>
            <option value='medium'>Medium</option>
            <option value='high'>High</option>
          </select>
        </label>
      </header>

      <ul style={{ marginTop: 12, paddingInlineStart: 18 }}>
        {filtered.map((event) => (
          <li key={event.id} style={{ marginBottom: 10 }}>
            <strong>{event.title}</strong> ({event.jurisdiction}) — <code>{event.risk}</code>
            <div style={{ fontSize: 13, color: '#475569' }}>{event.impactSummary}</div>
          </li>
        ))}
      </ul>
    </section>
  );
};
