import React from 'react';

type Signal = { id: string; candidate: string; coherence: number; contradiction: string; resolution: string };
type Props = { loading?: boolean; error?: string | null; data?: Signal[] };

const defaultData: Signal[] = [
  { id: 's1', candidate: 'Noa Levi', coherence: 71, contradiction: 'Strong coding / weak system design', resolution: 'Add focused architecture panel' },
  { id: 's2', candidate: 'Idan Bar', coherence: 84, contradiction: 'Leadership high / execution mixed', resolution: 'Run scoped execution drill' },
];

export const CandidateInterviewSignalCoherenceAnalyzerWithContradictionResolution: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  if (loading) return <p>Loading interview signal coherence analyzer...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No interview signal records available.</p>;

  return (
    <section>
      <h3>Candidate Interview Signal Coherence Analyzer</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {data.map((item) => (
          <article key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
            <strong>{item.candidate}</strong>
            <div>Coherence score: {item.coherence}%</div>
            <div>Contradiction: {item.contradiction}</div>
            <div>Resolution: {item.resolution}</div>
          </article>
        ))}
      </div>
    </section>
  );
};
