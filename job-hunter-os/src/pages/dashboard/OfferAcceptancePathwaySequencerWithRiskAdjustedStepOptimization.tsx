import React, { useMemo, useState } from 'react';

type Step = {
  id: string;
  name: string;
  baseRisk: number;
  owner: string;
};

type Props = {
  loading?: boolean;
  error?: string | null;
  data?: Step[];
};

const defaultSteps: Step[] = [
  { id: 's1', name: 'Comp alignment', baseRisk: 38, owner: 'Recruiter' },
  { id: 's2', name: 'Manager sign-off', baseRisk: 61, owner: 'Hiring Manager' },
  { id: 's3', name: 'Candidate close call', baseRisk: 47, owner: 'Lead Recruiter' },
];

export const OfferAcceptancePathwaySequencerWithRiskAdjustedStepOptimization: React.FC<Props> = ({
  loading = false,
  error = null,
  data = defaultSteps,
}) => {
  const [optimization, setOptimization] = useState(0);

  const sequenced = useMemo(
    () =>
      data
        .map((step) => ({ ...step, adjustedRisk: Math.max(0, step.baseRisk - optimization) }))
        .sort((a, b) => b.adjustedRisk - a.adjustedRisk),
    [data, optimization],
  );

  if (loading) return <p>Loading offer acceptance pathway...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No offer acceptance steps available.</p>;

  return (
    <section>
      <h3>Offer Acceptance Pathway Sequencer</h3>
      <label>
        Risk-adjusted optimization offset
        <input
          aria-label="Risk optimization"
          type="range"
          min={0}
          max={25}
          value={optimization}
          onChange={(e) => setOptimization(Number(e.target.value))}
        />
      </label>
      <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
        {sequenced.map((step) => (
          <article key={step.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
            <strong>{step.name}</strong>
            <div>Owner: {step.owner}</div>
            <div>Adjusted risk: {step.adjustedRisk}</div>
          </article>
        ))}
      </div>
    </section>
  );
};
