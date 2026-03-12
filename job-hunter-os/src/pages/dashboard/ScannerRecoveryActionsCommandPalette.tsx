import React, { useEffect, useMemo, useState } from 'react';

type ActionItem = { id: string; label: string; group: 'retry' | 'state' | 'diagnostics'; run: () => Promise<string> };

type Props = { busy?: boolean };

export const ScannerRecoveryActionsCommandPalette: React.FC<Props> = ({ busy = false }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const actions: ActionItem[] = useMemo(() => [
    { id: 'retry-all', label: 'Retry all sources', group: 'retry', run: async () => 'Retry all queued.' },
    { id: 'retry-by-source', label: 'Retry by source', group: 'retry', run: async () => 'Retry by source queued.' },
    { id: 'pause-resume', label: 'Pause/Resume scanner', group: 'state', run: async () => 'Scanner state toggled.' },
    { id: 'diagnostics', label: 'Open diagnostics', group: 'diagnostics', run: async () => 'Diagnostics opened.' },
  ], []);

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()) || a.id.includes(q.toLowerCase()));

  const execute = async (action: ActionItem) => {
    setRunning(true);
    setFeedback(null);
    try {
      const msg = await action.run();
      setFeedback(`Success: ${msg}`);
    } catch {
      setFeedback('Error: action failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <section>
      <h3>Scanner Recovery Actions Command Palette</h3>
      <button onClick={() => setOpen(true)}>Open Palette</button>
      {open && (
        <div role="dialog" aria-label="Scanner recovery command palette" style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, marginTop: 10 }}>
          <input aria-label="Search actions" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search actions" />
          <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
            {filtered.map((a) => (
              <button key={a.id} disabled={busy || running} onClick={() => execute(a)}>
                [{a.group}] {a.label}
              </button>
            ))}
          </div>
          {feedback && <p>{feedback}</p>}
        </div>
      )}
    </section>
  );
};
