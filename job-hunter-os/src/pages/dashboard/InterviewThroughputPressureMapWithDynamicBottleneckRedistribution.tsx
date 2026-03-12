import React, { useMemo, useState } from 'react';

type Lane = { id: string; stage: string; pressure: number; bottleneck: boolean; owner: string };
type Props = { loading?: boolean; error?: string | null; data?: Lane[] };

const defaultData: Lane[] = [
  { id: 'i1', stage: 'Screen', pressure: 72, bottleneck: false, owner: 'Team A' },
  { id: 'i2', stage: 'Interview', pressure: 94, bottleneck: true, owner: 'Team B' },
  { id: 'i3', stage: 'Panel', pressure: 63, bottleneck: false, owner: 'Team C' },
];

export const InterviewThroughputPressureMapWithDynamicBottleneckRedistribution: React.FC<Props> = ({ loading = false, error = null, data = defaultData }) => {
  const [redistributed, setRedistributed] = useState(false);
  const lanes = useMemo(() => (redistributed ? data.map((d) => (d.bottleneck ? { ...d, pressure: d.pressure - 15 } : { ...d, pressure: d.pressure + 6 })) : data), [data, redistributed]);

  if (loading) return <p>Loading throughput pressure map...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No throughput pressure signals available.</p>;

  return (
    <section>
      <h3>Interview Throughput Pressure Map</h3>
      <button onClick={() => setRedistributed(true)}>Redistribute Bottleneck Load</button>
      <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
        {lanes.map((lane) => (
          <article key={lane.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
            <strong>{lane.stage}</strong> • {lane.owner}
            <div>Pressure: {lane.pressure}%</div>
            <div>{lane.bottleneck ? 'Bottleneck lane' : 'Balanced lane'}</div>
          </article>
        ))}
      </div>
    </section>
  );
};
