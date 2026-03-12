import React from 'react';

type Scenario = { id: string; candidate: string; objectionPattern: string; recoveryPlan: string; declineRisk: number };
type Props = { loading?: boolean; error?: string | null; data?: Scenario[] };

const defaultData: Scenario[] = [
  { id: 'o1', candidate: 'Noa Levi', objectionPattern: 'Compensation gap', recoveryPlan: 'Phased bonus + growth path', declineRisk: 62 },
  { id: 'o2', candidate: 'Idan Bar', objectionPattern: 'Role scope uncertainty', recoveryPlan: 'Scoped 90-day charter', declineRisk: 48 },
];

export const OfferDeclinePreventionCockpitWithObjectionPatternRecoverySimulation: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  if (loading) return <p>Loading offer decline prevention cockpit...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No objection-pattern scenarios available.</p>;

  return (
    <section>
      <h3>Offer Decline Prevention Cockpit</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {data.map((item) => (
          <article key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
            <strong>{item.candidate}</strong>
            <div>Objection pattern: {item.objectionPattern}</div>
            <div>Recovery simulation: {item.recoveryPlan}</div>
            <div>Decline risk: {item.declineRisk}%</div>
          </article>
        ))}
      </div>
    </section>
  );
};
