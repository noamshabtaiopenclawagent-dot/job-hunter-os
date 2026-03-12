import React from 'react';

type PathItem = { id: string; dependency: string; owner: string; latencyHours: number; critical: boolean };
type Props = { loading?: boolean; error?: string | null; data?: PathItem[] };

const defaultData: PathItem[] = [
  { id: 'd1', dependency: 'Finance sign-off', owner: 'CFO Office', latencyHours: 14, critical: true },
  { id: 'd2', dependency: 'Legal clause review', owner: 'Legal', latencyHours: 9, critical: true },
  { id: 'd3', dependency: 'Manager approval', owner: 'Hiring Manager', latencyHours: 4, critical: false },
];

export const OfferApprovalLatencyCommandCenterWithDependencyCriticalPathSurfacing: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  if (loading) return <p>Loading offer approval latency command center...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No approval latency dependencies available.</p>;

  return (
    <section>
      <h3>Offer Approval Latency Command Center</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {data.map((item) => (
          <article key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, background: item.critical ? '#fee2e2' : '#f0fdf4' }}>
            <strong>{item.dependency}</strong>
            <div>Owner: {item.owner}</div>
            <div>Latency: {item.latencyHours}h</div>
            <div>{item.critical ? 'Critical path dependency' : 'Non-critical dependency'}</div>
          </article>
        ))}
      </div>
    </section>
  );
};
