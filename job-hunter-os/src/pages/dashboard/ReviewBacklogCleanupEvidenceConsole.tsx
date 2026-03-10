import React, { useMemo, useState } from 'react';

type ReviewTask = {
  id: string;
  title: string;
  artifactPath: string;
  integrationDelta: string;
  kpiProof: string;
  evidenceLinks: string[];
  verified: boolean;
  closed: boolean;
};

type Props = {
  tasks?: ReviewTask[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export const ReviewBacklogCleanupEvidenceConsole: React.FC<Props> = ({ tasks = [], loading = false, error = null, onRetry }) => {
  const [taskState, setTaskState] = useState(tasks);
  const [status, setStatus] = useState('Ready');
  const [showOnlyVerified, setShowOnlyVerified] = useState(true);

  const visible = useMemo(() => {
    return taskState
      .filter((t) => (showOnlyVerified ? t.verified : true))
      .filter((t) => !t.closed);
  }, [taskState, showOnlyVerified]);

  const closeTask = async (id: string) => {
    const before = taskState;
    setTaskState((curr) => curr.map((t) => (t.id === id ? { ...t, closed: true } : t)));
    setStatus(`Closing ${id}…`);
    try {
      await new Promise((resolve) => setTimeout(resolve, 220));
      setStatus(`Closed ${id}`);
    } catch {
      setTaskState(before);
      setStatus(`Failed ${id}, rollback complete`);
    }
  };

  if (loading) return <section aria-busy='true' style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Review Backlog Cleanup</h3><p style={{ color: '#6b7280' }}>Loading review tasks…</p></section>;
  if (error) return <section role='alert' style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 12, padding: 16 }}><h3 style={{ margin: 0, color: '#991b1b' }}>Cleanup unavailable</h3><p style={{ color: '#7f1d1d' }}>{error}</p><button type='button' onClick={onRetry}>Retry</button></section>;
  if (!tasks.length) return <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Review Backlog Cleanup</h3><p style={{ color: '#6b7280' }}>No review tasks loaded.</p></section>;

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Review Backlog Cleanup Console</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#6b7280' }}>Close verified review tasks only when contract evidence is present.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <label style={{ fontSize: 12, color: '#374151' }}>
            <input type='checkbox' checked={showOnlyVerified} onChange={(e) => setShowOnlyVerified(e.target.checked)} /> only verified
          </label>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{status}</div>
        </div>
      </header>

      <div style={{ display: 'grid', gap: 10 }}>
        {visible.length === 0 ? (
          <div style={{ border: '1px dashed #d1d5db', borderRadius: 8, padding: 12, color: '#6b7280' }}>No open verified tasks to close.</div>
        ) : visible.map((t) => (
          <article key={t.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#f9fafb' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.title}</div>
            <div style={{ fontSize: 12, color: '#374151', marginBottom: 4 }}><strong>Artifact(path):</strong> {t.artifactPath}</div>
            <div style={{ fontSize: 12, color: '#374151', marginBottom: 4 }}><strong>Integration delta:</strong> {t.integrationDelta}</div>
            <div style={{ fontSize: 12, color: '#374151', marginBottom: 6 }}><strong>KPI proof:</strong> {t.kpiProof}</div>
            <div style={{ fontSize: 12, marginBottom: 8 }}>
              <strong>Evidence:</strong>
              <ul style={{ margin: '4px 0 0 16px' }}>
                {t.evidenceLinks.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
            <button onClick={() => closeTask(t.id)} disabled={!t.verified}>
              Close verified task
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};
