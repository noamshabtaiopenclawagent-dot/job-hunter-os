import React, { useState } from 'react';

type Candidate = { id: string; name: string; matchScore: number; status: 'new' | 'shortlisted' | 'rejected' };

type Props = { candidates?: Candidate[] };

export const MatchShortlistActionRail: React.FC<Props> = ({
  candidates = [
    { id: 'm1', name: 'Noa Levi', matchScore: 91, status: 'new' },
    { id: 'm2', name: 'Idan Bar', matchScore: 84, status: 'shortlisted' },
    { id: 'm3', name: 'Maya Cohen', matchScore: 77, status: 'new' },
  ],
}) => {
  const [rows, setRows] = useState(candidates);

  const updateStatus = (id: string, status: Candidate['status']) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  return (
    <section>
      <h3>Match Shortlist Action Rail</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.map((r) => (
          <div key={r.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>{r.name} • score {r.matchScore} • {r.status}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => updateStatus(r.id, 'shortlisted')}>Shortlist</button>
              <button onClick={() => updateStatus(r.id, 'rejected')}>Reject</button>
              <button onClick={() => updateStatus(r.id, 'new')}>Reset</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
