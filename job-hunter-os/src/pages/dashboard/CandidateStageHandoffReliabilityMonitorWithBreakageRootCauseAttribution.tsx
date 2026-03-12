import React from 'react';

type Row = { id: string; stage: string; reliability: number; breakageRootCause: string; owner: string };
type Props = { loading?: boolean; error?: string | null; data?: Row[] };

const defaultData: Row[] = [
  { id: 'h1', stage: 'Screen -> Interview', reliability: 92, breakageRootCause: 'Missing interviewer assignment', owner: 'Recruiting Ops' },
  { id: 'h2', stage: 'Interview -> Offer', reliability: 78, breakageRootCause: 'Delayed panel feedback', owner: 'Hiring Manager' },
];

export const CandidateStageHandoffReliabilityMonitorWithBreakageRootCauseAttribution: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  if (loading) return <p>Loading handoff reliability monitor...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No handoff reliability records available.</p>;

  return (
    <section>
      <h3>Candidate-stage Handoff Reliability Monitor</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {data.map((row) => (
          <article key={row.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
            <strong>{row.stage}</strong>
            <div>Reliability: {row.reliability}%</div>
            <div>Root cause: {row.breakageRootCause}</div>
            <div>Owner: {row.owner}</div>
          </article>
        ))}
      </div>
    </section>
  );
};
