import React from 'react';

type Debrief = {
  id: string;
  candidate: string;
  role: string;
  consensusScore: number;
  dissenters: { name: string; reason: string }[];
  resolutionPlan: string;
};

type Props = {
  loading?: boolean;
  error?: string | null;
  data?: Debrief[];
};

const defaultData: Debrief[] = [
  {
    id: 'd1',
    candidate: 'Noa Levi',
    role: 'Frontend Engineer',
    consensusScore: 65,
    dissenters: [{ name: 'Alex', reason: 'Concerns about state management depth' }],
    resolutionPlan: 'Follow-up code review async',
  },
  {
    id: 'd2',
    candidate: 'Idan Bar',
    role: 'Backend Engineer',
    consensusScore: 82,
    dissenters: [{ name: 'Dana', reason: 'System design scaling answers were vague' }],
    resolutionPlan: 'Schedule 30m architecture deep-dive',
  }
];

export const InterviewDebriefConsensusStabilizerWithDissentResolutionPathway: React.FC<Props> = ({
  loading = false,
  error = null,
  data = defaultData,
}) => {
  if (loading) return <p>Loading debrief consensus stabilizer...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No debrief items available.</p>;

  return (
    <section>
      <h3>Interview Debrief Consensus Stabilizer</h3>
      <div style={{ display: 'grid', gap: 10 }}>
        {data.map((item) => (
          <article key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <strong>{item.candidate}</strong> — {item.role}
            <div>Consensus: {item.consensusScore}%</div>
            <div>
              Dissenting reviewers:{' '}
              {item.dissenters.map((d) => (
                <span key={d.name} title={d.reason} style={{ marginRight: 6, textDecoration: 'underline dotted', cursor: 'help' }}>
                  {d.name}
                </span>
              ))}
            </div>
            <div>Resolution plan: {item.resolutionPlan}</div>
          </article>
        ))}
      </div>
    </section>
  );
};
