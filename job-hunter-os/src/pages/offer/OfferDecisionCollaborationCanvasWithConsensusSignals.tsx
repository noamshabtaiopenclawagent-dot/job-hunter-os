import React, { useMemo, useState } from 'react';

type ParticipantRole = 'recruiter' | 'hiring_manager' | 'approver';
type DecisionTag = 'approve' | 'hold' | 'escalate' | 'counter';

type InputSignal = {
  id: string;
  participant: string;
  role: ParticipantRole;
  confidence: number;
  stance: DecisionTag;
  note: string;
  updatedAt: string;
};

type ThreadComment = {
  id: string;
  author: string;
  role: ParticipantRole;
  tag: DecisionTag;
  text: string;
  pending?: boolean;
  failed?: boolean;
};

type Blocker = {
  id: string;
  label: string;
  owner: string;
  severity: 'low' | 'medium' | 'high';
  resolved: boolean;
};

type Props = {
  signals?: InputSignal[];
  comments?: ThreadComment[];
  blockers?: Blocker[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const tagColor: Record<DecisionTag, string> = {
  approve: '#15803d',
  hold: '#b45309',
  escalate: '#b91c1c',
  counter: '#1d4ed8',
};

const blockerColor: Record<Blocker['severity'], string> = {
  low: '#65a30d',
  medium: '#d97706',
  high: '#b91c1c',
};

const computeConsensus = (signals: InputSignal[]) => {
  if (!signals.length) return 0;
  const stanceWeight: Record<DecisionTag, number> = { approve: 1, counter: 0.6, hold: 0.35, escalate: 0.1 };
  const sum = signals.reduce((acc, s) => acc + s.confidence * stanceWeight[s.stance], 0);
  return Math.round(sum / signals.length);
};

export const OfferDecisionCollaborationCanvasWithConsensusSignals: React.FC<Props> = ({
  signals = [],
  comments = [],
  blockers = [],
  loading = false,
  error = null,
  onRetry,
}) => {
  const [signalState, setSignalState] = useState<InputSignal[]>(signals);
  const [commentState, setCommentState] = useState<ThreadComment[]>(comments);
  const [blockerState, setBlockerState] = useState<Blocker[]>(blockers);
  const [draft, setDraft] = useState('');
  const [draftTag, setDraftTag] = useState<DecisionTag>('hold');
  const [status, setStatus] = useState<string>('Ready');
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  const consensus = useMemo(() => computeConsensus(signalState), [signalState]);

  const timeline = useMemo(
    () => [...signalState].sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()),
    [signalState],
  );

  const unresolved = useMemo(() => blockerState.filter((b) => !b.resolved), [blockerState]);

  const addComment = async () => {
    if (!draft.trim()) return;
    const optimistic: ThreadComment = {
      id: `tmp-${Date.now()}`,
      author: 'You',
      role: 'recruiter',
      tag: draftTag,
      text: draft,
      pending: true,
    };
    setCommentState((prev) => [optimistic, ...prev]);
    setStatus('Saving comment…');
    const text = draft;
    setDraft('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 220));
      setCommentState((prev) => prev.map((c) => (c.id === optimistic.id ? { ...c, pending: false } : c)));
      setStatus('Comment saved');
      setActiveCommentId(optimistic.id);
    } catch {
      setCommentState((prev) => prev.map((c) => (c.id === optimistic.id ? { ...c, pending: false, failed: true, text } : c)));
      setStatus('Save failed');
    }
  };

  const oneClickNextStep = async (action: 'approve' | 'escalate' | 'counter') => {
    const before = signalState;
    const nextSignal: InputSignal = {
      id: `s-${Date.now()}`,
      participant: 'System Action',
      role: 'approver',
      confidence: action === 'approve' ? 85 : action === 'counter' ? 62 : 40,
      stance: action,
      note: `One-click ${action} action applied`,
      updatedAt: new Date().toISOString(),
    };

    setSignalState((prev) => [nextSignal, ...prev]);
    setStatus(`${action} pending…`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 240));
      setStatus(`${action} applied`);
    } catch {
      setSignalState(before);
      setStatus(`${action} failed, rollback complete`);
    }
  };

  const resolveBlocker = async (id: string) => {
    const before = blockerState;
    setBlockerState((prev) => prev.map((b) => (b.id === id ? { ...b, resolved: true } : b)));
    setStatus('Resolving blocker…');
    try {
      await new Promise((resolve) => setTimeout(resolve, 180));
      setStatus('Blocker resolved');
    } catch {
      setBlockerState(before);
      setStatus('Blocker resolve failed');
    }
  };

  if (loading) return <section aria-busy='true' style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Offer Decision Collaboration Canvas</h3><p style={{ color: '#6b7280' }}>Loading decision signals…</p></section>;
  if (error) return <section role='alert' style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 12, padding: 16 }}><h3 style={{ margin: 0, color: '#991b1b' }}>Canvas unavailable</h3><p style={{ color: '#7f1d1d' }}>{error}</p><button type='button' onClick={onRetry}>Retry</button></section>;
  if (!signals.length) return <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Offer Decision Collaboration Canvas</h3><p style={{ color: '#6b7280' }}>No offer decision signals available.</p></section>;

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Offer Decision Collaboration Canvas</h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>Unify recruiter, manager, and approver signals into a live consensus model.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>{status}</span>
          <span style={{ background: consensus >= 70 ? '#dcfce7' : '#fef3c7', color: consensus >= 70 ? '#166534' : '#92400e', borderRadius: 999, padding: '2px 10px', fontSize: 12 }}>
            Consensus {consensus}%
          </span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 16 }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Confidence trend timeline</div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
              {timeline.map((s) => (
                <div key={s.id} style={{ minWidth: 120, border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, background: '#f9fafb' }}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{s.participant}</div>
                  <div style={{ fontWeight: 600 }}>{s.confidence}%</div>
                  <div style={{ fontSize: 12, color: tagColor[s.stance] }}>{s.stance}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Threaded comments</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => oneClickNextStep('approve')} accessKey='a'>Approve</button>
                <button onClick={() => oneClickNextStep('counter')} accessKey='c'>Counter</button>
                <button onClick={() => oneClickNextStep('escalate')} accessKey='e'>Escalate</button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
              <select value={draftTag} onChange={(e) => setDraftTag(e.target.value as DecisionTag)}>
                <option value='approve'>approve</option>
                <option value='hold'>hold</option>
                <option value='counter'>counter</option>
                <option value='escalate'>escalate</option>
              </select>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder='Add decision note…'
                rows={3}
                aria-label='Decision comment input'
              />
              <button onClick={addComment}>Post comment</button>
            </div>

            <div style={{ display: 'grid', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
              {commentState.map((c) => (
                <div
                  key={c.id}
                  tabIndex={0}
                  onFocus={() => setActiveCommentId(c.id)}
                  style={{ border: activeCommentId === c.id ? '2px solid #2563eb' : '1px solid #e5e7eb', borderRadius: 8, padding: 8, background: '#fff' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span>{c.author} · {c.role}</span>
                    <span style={{ color: tagColor[c.tag] }}>{c.tag}</span>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 13 }}>{c.text}</div>
                  {c.pending && <div style={{ fontSize: 11, color: '#6b7280' }}>Pending…</div>}
                  {c.failed && <div style={{ fontSize: 11, color: '#b91c1c' }}>Failed to sync</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#f8fafc' }}>
          <h3 style={{ marginTop: 0, fontSize: 14 }}>Unresolved blocker lane</h3>
          <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
            {unresolved.length === 0 ? (
              <div style={{ color: '#6b7280', fontSize: 12 }}>No open blockers</div>
            ) : unresolved.map((b) => (
              <div key={b.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <strong>{b.label}</strong>
                  <span style={{ color: blockerColor[b.severity] }}>{b.severity}</span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Owner: {b.owner}</div>
                <button onClick={() => resolveBlocker(b.id)} style={{ marginTop: 6 }}>Resolve</button>
              </div>
            ))}
          </div>

          <h4 style={{ margin: '0 0 8px 0', fontSize: 13 }}>Projected impact chips</h4>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>+{Math.max(1, Math.round(consensus * 0.08))}% approval confidence</span>
            <span style={{ background: '#dbeafe', color: '#1e3a8a', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>-{Math.max(1, Math.round(unresolved.length * 1.6))}d cycle risk</span>
          </div>
        </aside>
      </div>
    </section>
  );
};
