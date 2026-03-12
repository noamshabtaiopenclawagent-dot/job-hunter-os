import React, { useState } from 'react';

type AlertItem = {
  id: string;
  candidate: string;
  decayDelta: number;
  blocker: string;
};

type Props = {
  loading?: boolean;
  error?: string | null;
  data?: AlertItem[];
};

const defaultData: AlertItem[] = [
  { id: 'm1', candidate: 'Noa Levi', decayDelta: -14, blocker: 'Missing interviewer feedback' },
  { id: 'm2', candidate: 'Idan Bar', decayDelta: -9, blocker: 'Hiring manager approval pending' },
];

export const CandidateMomentumDecayAlertRail: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  const [items, setItems] = useState(data);

  if (loading) return <p>Loading momentum decay alerts...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!items.length) return <p>No momentum decay alerts.</p>;

  const removeItem = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id));

  return (
    <section onKeyDown={(e) => {
      if (e.key.toLowerCase() === 'f') removeItem(items[0]?.id);
      if (e.key.toLowerCase() === 'r') removeItem(items[0]?.id);
      if (e.key.toLowerCase() === 's') removeItem(items[0]?.id);
    }} tabIndex={0}>
      <h3>Candidate Momentum Decay Alert Rail</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {items.map((item) => (
          <article key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
            <strong>{item.candidate}</strong>
            <div>Decay delta: {item.decayDelta}</div>
            <div>Blocker: {item.blocker}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button onClick={() => removeItem(item.id)}>Follow-up</button>
              <button onClick={() => removeItem(item.id)}>Resolve</button>
              <button onClick={() => removeItem(item.id)}>Snooze</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
// CandidateMomentumDecayAlertRail
