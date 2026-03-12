import React, { useMemo, useState } from 'react';

type Candidate = {
  id: string;
  name: string;
  daysSilent: number;
  attritionRisk: 'low' | 'medium' | 'high';
};

type Props = {
  loading?: boolean;
  error?: string | null;
  data?: Candidate[];
};

const defaultData: Candidate[] = [
  { id: 'r1', name: 'Noa Levi', daysSilent: 6, attritionRisk: 'high' },
  { id: 'r2', name: 'Idan Bar', daysSilent: 3, attritionRisk: 'medium' },
  { id: 'r3', name: 'Maya Cohen', daysSilent: 1, attritionRisk: 'low' },
];

export const CandidateReEngagementSequencingStudioWithAttritionRiskGating: React.FC<Props> = ({
  loading = false,
  error = null,
  data = defaultData,
}) => {
  const [riskGate, setRiskGate] = useState<'all' | 'medium-plus' | 'high-only'>('medium-plus');

  const sequenced = useMemo(() => {
    const gated = data.filter((candidate) => {
      if (riskGate === 'all') return true;
      if (riskGate === 'high-only') return candidate.attritionRisk === 'high';
      return candidate.attritionRisk === 'high' || candidate.attritionRisk === 'medium';
    });

    return gated.sort((a, b) => b.daysSilent - a.daysSilent);
  }, [data, riskGate]);

  if (loading) return <p>Loading re-engagement sequencing studio...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No candidate re-engagement targets available.</p>;

  return (
    <section>
      <h3>Candidate Re-engagement Sequencing Studio</h3>
      <label>
        Attrition Risk Gate
        <select aria-label="Attrition Risk Gate" value={riskGate} onChange={(e) => setRiskGate(e.target.value as any)}>
          <option value="all">All</option>
          <option value="medium-plus">Medium + High</option>
          <option value="high-only">High Only</option>
        </select>
      </label>

      <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
        {sequenced.map((candidate, idx) => (
          <article key={candidate.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
            <strong>#{idx + 1} {candidate.name}</strong>
            <div>Days silent: {candidate.daysSilent}</div>
            <div>Attrition risk: {candidate.attritionRisk}</div>
          </article>
        ))}
      </div>
    </section>
  );
};
