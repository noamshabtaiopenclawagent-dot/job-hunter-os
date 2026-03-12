import React, { useMemo, useState } from 'react';

type Queue = { id: string; recruiter: string; activeLoad: number; agingHours: number };
type Props = { loading?: boolean; error?: string | null; data?: Queue[] };

const defaultData: Queue[] = [
  { id: 'q1', recruiter: 'Dana', activeLoad: 18, agingHours: 22 },
  { id: 'q2', recruiter: 'Eli', activeLoad: 11, agingHours: 9 },
  { id: 'q3', recruiter: 'Ruth', activeLoad: 14, agingHours: 16 },
];

export const RecruiterCapacityAllocationSandboxWithQueueAgingMitigationOptions: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  const [mitigation, setMitigation] = useState<'none' | 'rebalance' | 'burst'>('none');

  const rows = useMemo(() => {
    if (mitigation === 'none') return data;
    if (mitigation === 'rebalance') {
      return data.map((row) => ({ ...row, activeLoad: Math.max(8, row.activeLoad - 2), agingHours: Math.max(4, row.agingHours - 3) }));
    }
    return data.map((row) => ({ ...row, activeLoad: Math.max(7, row.activeLoad - 3), agingHours: Math.max(3, row.agingHours - 5) }));
  }, [data, mitigation]);

  if (loading) return <p>Loading recruiter capacity sandbox...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No recruiter capacity rows available.</p>;

  return (
    <section>
      <h3>Recruiter Capacity Allocation Sandbox</h3>
      <label>
        Queue-aging mitigation
        <select aria-label="Queue Aging Mitigation" value={mitigation} onChange={(e) => setMitigation(e.target.value as any)}>
          <option value="none">No mitigation</option>
          <option value="rebalance">Rebalance queues</option>
          <option value="burst">Burst staffing</option>
        </select>
      </label>
      <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
        {rows.map((row) => (
          <article key={row.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
            <strong>{row.recruiter}</strong>
            <div>Active load: {row.activeLoad}</div>
            <div>Queue aging: {row.agingHours}h</div>
          </article>
        ))}
      </div>
    </section>
  );
};
