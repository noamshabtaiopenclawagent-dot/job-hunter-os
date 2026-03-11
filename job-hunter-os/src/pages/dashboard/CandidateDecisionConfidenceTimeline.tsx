import React, { useMemo, useState } from 'react';

type DecisionPoint = {
  id: string;
  candidate: string;
  stage: string;
  confidence: number;
  timestamp: string;
  rationale: string;
};

type Props = {
  loading?: boolean;
  error?: string | null;
  data?: DecisionPoint[];
};

const defaultData: DecisionPoint[] = [
  { id: 'd1', candidate: 'Noa Levi', stage: 'screen', confidence: 62, timestamp: '2026-03-10 09:15', rationale: 'Strong domain signal, moderate role fit' },
  { id: 'd2', candidate: 'Noa Levi', stage: 'interview', confidence: 78, timestamp: '2026-03-10 14:40', rationale: 'Panel alignment improved confidence' },
  { id: 'd3', candidate: 'Idan Bar', stage: 'offer', confidence: 85, timestamp: '2026-03-11 11:20', rationale: 'Comp and fit signals stable' },
];

export const CandidateDecisionConfidenceTimeline: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  const [candidateFilter, setCandidateFilter] = useState('all');

  const candidates = useMemo(() => Array.from(new Set(data.map((d) => d.candidate))), [data]);
  const filtered = useMemo(
    () => data.filter((d) => candidateFilter === 'all' || d.candidate === candidateFilter),
    [data, candidateFilter],
  );

  if (loading) return <p>Loading decision confidence timeline...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No decision confidence events found.</p>;

  return (
    <section>
      <h3>Candidate Decision Confidence Timeline</h3>
      <label>
        Candidate Filter
        <select aria-label="Candidate Filter" value={candidateFilter} onChange={(e) => setCandidateFilter(e.target.value)}>
          <option value="all">All</option>
          {candidates.map((candidate) => (
            <option key={candidate} value={candidate}>{candidate}</option>
          ))}
        </select>
      </label>

      <ol style={{ marginTop: 14, display: 'grid', gap: 10 }}>
        {filtered.map((point) => (
          <li key={point.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <strong>{point.candidate}</strong> — {point.stage}
            <div>Confidence: <strong>{point.confidence}%</strong></div>
            <div>{point.timestamp}</div>
            <div title={point.rationale}>Rationale: {point.rationale}</div>
          </li>
        ))}
      </ol>
    </section>
  );
};
