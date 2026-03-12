import React, { useState } from 'react';

type Cell = { id: string; interviewer: string; competency: string; variance: number; correctiveOwner: string };
type Props = { loading?: boolean; error?: string | null; data?: Cell[] };

const defaultData: Cell[] = [
  { id: 'c1', interviewer: 'Interviewer A', competency: 'System Design', variance: 18, correctiveOwner: 'Lead A' },
  { id: 'c2', interviewer: 'Interviewer B', competency: 'Behavioral', variance: 7, correctiveOwner: 'Lead B' },
  { id: 'c3', interviewer: 'Interviewer C', competency: 'Coding', variance: 13, correctiveOwner: 'Lead A' },
];

export const InterviewCalibrationVarianceHeatgridWithCorrectiveAssignmentQueue: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  const [queued, setQueued] = useState<string[]>([]);

  if (loading) return <p>Loading calibration variance heatgrid...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No calibration variance records available.</p>;

  return (
    <section>
      <h3>Interview Calibration Variance Heatgrid</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {data.map((cell) => (
          <article key={cell.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, background: cell.variance >= 15 ? '#fee2e2' : cell.variance >= 10 ? '#fef3c7' : '#dcfce7' }}>
            <strong>{cell.interviewer}</strong> • {cell.competency}
            <div>Variance: {cell.variance}%</div>
            <div>Corrective owner: {cell.correctiveOwner}</div>
            <button onClick={() => setQueued((prev) => [...new Set([...prev, cell.id])])}>Queue Corrective Assignment</button>
          </article>
        ))}
      </div>
      {queued.length > 0 && <p>Queued corrective assignments: {queued.length}</p>}
    </section>
  );
};
