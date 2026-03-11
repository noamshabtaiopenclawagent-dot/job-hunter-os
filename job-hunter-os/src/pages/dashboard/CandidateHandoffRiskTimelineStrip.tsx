import React, { useMemo, useState } from 'react';

type RiskPoint = { id: string; candidate: string; stage: string; risk: 'low' | 'medium' | 'high'; time: string; note: string };

type Props = { loading?: boolean; error?: string | null; data?: RiskPoint[] };

const defaultData: RiskPoint[] = [
  { id: 'r1', candidate: 'Noa Levi', stage: 'screen', risk: 'medium', time: '09:10', note: 'Missing interview notes' },
  { id: 'r2', candidate: 'Noa Levi', stage: 'handoff', risk: 'high', time: '11:30', note: 'Approver mismatch' },
  { id: 'r3', candidate: 'Idan Bar', stage: 'offer', risk: 'low', time: '13:20', note: 'All gates green' },
];

const color = { low: '#dcfce7', medium: '#fef3c7', high: '#fecaca' } as const;

export const CandidateHandoffRiskTimelineStrip: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  const [candidateFilter, setCandidateFilter] = useState('all');
  const [selected, setSelected] = useState<string | null>(null);
  const candidates = useMemo(() => Array.from(new Set(data.map((d) => d.candidate))), [data]);
  const filtered = useMemo(() => data.filter((d) => candidateFilter === 'all' || d.candidate === candidateFilter), [data, candidateFilter]);

  if (loading) return <p>Loading handoff risk timeline...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No handoff risks recorded.</p>;

  return (
    <section>
      <h3>Candidate Handoff Risk Timeline Strip</h3>
      <label>
        Candidate Filter
        <select aria-label="Handoff Risk Candidate Filter" value={candidateFilter} onChange={(e) => setCandidateFilter(e.target.value)}>
          <option value="all">All</option>
          {candidates.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 10 }}>
        {filtered.map((point) => (
          <button key={point.id} title={`${point.candidate} ${point.time} ${point.risk}`} onClick={() => setSelected(point.id)} style={{ border: '1px solid #d1d5db', background: color[point.risk], borderRadius: 8, padding: '8px 10px', minWidth: 170, textAlign: 'left' }}>
            <strong>{point.candidate}</strong>
            <div>{point.stage} • {point.time}</div>
            <div>Risk: {point.risk}</div>
          </button>
        ))}
      </div>
      {selected && <p style={{ marginTop: 8 }}>Opened risk detail: {selected}</p>}
    </section>
  );
};
