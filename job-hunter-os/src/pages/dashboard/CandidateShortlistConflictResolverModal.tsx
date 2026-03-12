import React, { useState } from 'react';

type Props = { open?: boolean; loading?: boolean; error?: string | null; left?: string; right?: string };

export const CandidateShortlistConflictResolverModal: React.FC<Props> = ({
  open = true,
  loading = false,
  error = null,
  left = 'Noa Levi • score 91 • source LinkedIn',
  right = 'Noa Levy • score 89 • source Referral',
}) => {
  const [isOpen, setIsOpen] = useState(open);
  const [auditNote, setAuditNote] = useState('');
  const [state, setState] = useState<'idle' | 'pending' | 'success'>('idle');
  const [validation, setValidation] = useState<string | null>(null);

  if (!isOpen) return <button onClick={() => setIsOpen(true)}>Open conflict resolver</button>;
  if (loading) return <p>Loading conflicts…</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!left && !right) return <p>No conflicts found.</p>;

  const keep = async (which: 'left' | 'right') => {
    if (!auditNote.trim()) {
      setValidation('Audit note is required for keep actions');
      return;
    }
    setValidation(null);
    setState('pending');
    await new Promise((r) => setTimeout(r, 25));
    setState('success');
  };

  const merge = async () => {
    setValidation(null);
    setState('pending');
    await new Promise((r) => setTimeout(r, 25));
    setState('success');
  };

  return (
    <div role="dialog" aria-label="Candidate shortlist conflict resolver" onKeyDown={(e) => {
      if (e.key === 'Escape') setIsOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') merge();
    }} tabIndex={0} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12 }}>
      <h3>Candidate Shortlist Conflict Resolver</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>{left}</div>
        <div>{right}</div>
      </div>
      <label>
        Audit note
        <input aria-label="Audit note" value={auditNote} onChange={(e) => setAuditNote(e.target.value)} />
      </label>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={() => keep('left')}>Keep left</button>
        <button onClick={() => keep('right')}>Keep right</button>
        <button onClick={merge}>Merge both</button>
      </div>
      {validation && <p style={{ color: '#b45309' }}>{validation}</p>}
      {state === 'pending' && <p>Pending…</p>}
      {state === 'success' && <p>Success: conflict resolved</p>}
    </div>
  );
};
