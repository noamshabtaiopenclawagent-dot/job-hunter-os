import React, { useMemo, useState } from 'react';

type ToastItem = {
  id: string;
  candidate: string;
  queue: string;
  minutesOverdue: number;
  severity: 'medium' | 'high';
};

type Props = {
  loading?: boolean;
  error?: string | null;
  data?: ToastItem[];
};

const defaultData: ToastItem[] = [
  { id: 't1', candidate: 'Noa Levi', queue: 'Interview Follow-up', minutesOverdue: 35, severity: 'medium' },
  { id: 't2', candidate: 'Idan Bar', queue: 'Offer Follow-up', minutesOverdue: 70, severity: 'high' },
];

export const FollowUpQueueSlaBreachNotifierToastCenter: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const active = useMemo(() => data.filter((d) => !dismissed.includes(d.id)), [data, dismissed]);

  if (loading) return <p>Loading SLA breach toasts...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length || !active.length) return <p>No active SLA breach notifications.</p>;

  return (
    <section>
      <h3>Follow-up Queue SLA Breach Notifier Toast Center</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {active.map((toast) => (
          <div key={toast.id} role="status" style={{ border: '1px solid #d1d5db', borderLeft: `6px solid ${toast.severity === 'high' ? '#dc2626' : '#d97706'}`, borderRadius: 8, padding: 10, background: '#fff' }}>
            <strong>{toast.candidate}</strong> • {toast.queue}
            <div>{toast.minutesOverdue} min overdue ({toast.severity})</div>
            <button onClick={() => setDismissed((prev) => [...prev, toast.id])} aria-label={`Dismiss ${toast.id}`}>Dismiss</button>
          </div>
        ))}
      </div>
    </section>
  );
};
