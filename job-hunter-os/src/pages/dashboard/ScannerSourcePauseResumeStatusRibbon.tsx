import React, { useState } from 'react';

type SourceState = { id: string; source: string; paused: boolean };

export const ScannerSourcePauseResumeStatusRibbon: React.FC = () => {
  const [rows, setRows] = useState<SourceState[]>([
    { id: 's1', source: 'AllJobs IL', paused: false },
    { id: 's2', source: 'LinkedIn ISR', paused: true },
    { id: 's3', source: 'Drushim', paused: false },
  ]);

  return (
    <section>
      <h3>Scanner Source Pause/Resume Status Ribbon</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {rows.map((r) => (
          <button
            key={r.id}
            onClick={() => setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, paused: !x.paused } : x)))}
            style={{ border: '1px solid #e5e7eb', borderRadius: 999, padding: '6px 10px', background: r.paused ? '#fef2f2' : '#ecfeff' }}
          >
            {r.source}: {r.paused ? 'Paused' : 'Running'}
          </button>
        ))}
      </div>
    </section>
  );
};
