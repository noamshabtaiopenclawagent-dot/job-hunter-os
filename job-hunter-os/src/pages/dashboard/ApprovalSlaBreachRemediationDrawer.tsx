import React, { useState } from 'react';

type ActionState = 'idle' | 'pending' | 'success' | 'error';
type BreachItem = { id: string; owner: string; durationMin: number; urgency: 'medium' | 'high'; chain: string };

type Props = { loading?: boolean; error?: string | null; data?: BreachItem[]; simulateError?: boolean };

const defaultData: BreachItem[] = [
  { id: 'b1', owner: 'Recruiter A', durationMin: 95, urgency: 'high', chain: 'Lead > Ops' },
  { id: 'b2', owner: 'Recruiter B', durationMin: 45, urgency: 'medium', chain: 'Lead' },
];

export const ApprovalSlaBreachRemediationDrawer: React.FC<Props> = ({ loading = false, error = null, data = defaultData, simulateError = false }) => {
  const [items] = useState(data);
  const [states, setStates] = useState<Record<string, ActionState>>({});

  if (loading) return <p>Loading approval SLA breaches...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!items.length) return <p>No approval SLA breaches.</p>;

  const run = async (id: string) => {
    setStates((prev) => ({ ...prev, [id]: 'pending' }));
    await new Promise((r) => setTimeout(r, 150));
    setStates((prev) => ({ ...prev, [id]: simulateError ? 'error' : 'success' }));
  };

  return (
    <section tabIndex={0} onKeyDown={(e) => {
      const id = items[0]?.id;
      if (!id) return;
      if (['a', 'e', 'r'].includes(e.key.toLowerCase())) void run(id);
    }}>
      <h3>Approval SLA Breach Remediation Drawer</h3>
      {items.map((item) => (
        <article key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8 }}>
          <strong>{item.owner}</strong> • {item.urgency}
          <div>Breach duration: {item.durationMin} min</div>
          <div>Owner chain: {item.chain}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button onClick={() => void run(item.id)}>Reassign</button>
            <button onClick={() => void run(item.id)}>Escalate</button>
            <button onClick={() => void run(item.id)}>Resolve</button>
          </div>
          {states[item.id] === 'pending' && <p>Action pending...</p>}
          {states[item.id] === 'success' && <p>Action success.</p>}
          {states[item.id] === 'error' && <p style={{ color: '#991b1b' }}>Action failed.</p>}
        </article>
      ))}
    </section>
  );
};
