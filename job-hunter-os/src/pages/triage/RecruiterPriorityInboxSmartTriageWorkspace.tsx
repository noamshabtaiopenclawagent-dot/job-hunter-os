import React, { useMemo, useState } from 'react';

type Stage = 'applied' | 'screen' | 'interview' | 'offer' | 'closing';
type Urgency = 'low' | 'medium' | 'high' | 'critical';

type CandidateActionRecord = {
  id: string;
  candidateName: string;
  role: string;
  recruiter: string;
  stage: Stage;
  slaHoursRemaining: number;
  stageUrgency: number; // 0-100
  expectedConversionLift: number; // 0-100
  slaRisk: number; // 0-100
  owner: string;
  blockedBy?: string;
  partial?: boolean;
};

type BulkAction = 'assign' | 'snooze' | 'escalate';

type FilterPreset = {
  id: string;
  name: string;
  minRisk: number;
  stage: 'all' | Stage;
  owner: 'all' | string;
};

type Props = {
  data?: CandidateActionRecord[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onExecuteBulkAction?: (action: BulkAction, ids: string[]) => Promise<void>;
};

const stageOrder: Stage[] = ['applied', 'screen', 'interview', 'offer', 'closing'];

const urgencyLabel = (score: number): Urgency => {
  if (score >= 85) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
};

const urgencyColor: Record<Urgency, string> = {
  low: '#16a34a',
  medium: '#ca8a04',
  high: '#ea580c',
  critical: '#b91c1c',
};

const scoreActionPriority = (r: CandidateActionRecord) => {
  const slaPressure = r.slaHoursRemaining < 0 ? 100 : Math.max(0, 100 - r.slaHoursRemaining * 3);
  const weighted = r.slaRisk * 0.45 + r.stageUrgency * 0.3 + r.expectedConversionLift * 0.25 + slaPressure * 0.2;
  return Math.min(100, Math.round(weighted));
};

const basePresets: FilterPreset[] = [
  { id: 'critical-now', name: 'Critical Now', minRisk: 80, stage: 'all', owner: 'all' },
  { id: 'offer-save', name: 'Offer Save', minRisk: 65, stage: 'offer', owner: 'all' },
  { id: 'interview-throughput', name: 'Interview Throughput', minRisk: 55, stage: 'interview', owner: 'all' },
];

export const RecruiterPriorityInboxSmartTriageWorkspace: React.FC<Props> = ({
  data = [],
  loading = false,
  error = null,
  onRetry,
  onExecuteBulkAction,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [minRisk, setMinRisk] = useState(50);
  const [stageFilter, setStageFilter] = useState<'all' | Stage>('all');
  const [ownerFilter, setOwnerFilter] = useState<'all' | string>('all');
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>(basePresets);
  const [pending, setPending] = useState<BulkAction | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [records, setRecords] = useState<CandidateActionRecord[]>(data);

  const owners = useMemo(() => ['all', ...Array.from(new Set(records.map((r) => r.owner))).sort()], [records]);

  const filtered = useMemo(() => {
    return records
      .map((r) => ({ ...r, priorityScore: scoreActionPriority(r) }))
      .filter((r) => r.priorityScore >= minRisk)
      .filter((r) => (stageFilter === 'all' ? true : r.stage === stageFilter))
      .filter((r) => (ownerFilter === 'all' ? true : r.owner === ownerFilter))
      .sort((a, b) => b.priorityScore - a.priorityScore || stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage));
  }, [records, minRisk, stageFilter, ownerFilter]);

  const allVisibleSelected = filtered.length > 0 && filtered.every((r) => selectedIds.includes(r.id));
  const partialCount = records.filter((r) => r.partial).length;

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedIds((ids) => ids.filter((id) => !filtered.some((r) => r.id === id)));
      return;
    }
    setSelectedIds((ids) => Array.from(new Set([...ids, ...filtered.map((r) => r.id)])));
  };

  const applyPreset = (preset: FilterPreset) => {
    setMinRisk(preset.minRisk);
    setStageFilter(preset.stage);
    setOwnerFilter(preset.owner);
  };

  const saveCurrentPreset = () => {
    const next: FilterPreset = {
      id: `custom-${Date.now()}`,
      name: `Risk ${minRisk}+ ${stageFilter === 'all' ? 'All Stages' : stageFilter}`,
      minRisk,
      stage: stageFilter,
      owner: ownerFilter,
    };
    setSavedPresets((prev) => [...prev.slice(-5), next]);
    setFeedback('Preset saved');
  };

  const runBulkAction = async (action: BulkAction) => {
    if (!selectedIds.length || pending) return;

    const prev = records;
    const applyOptimistic = (r: CandidateActionRecord) => {
      if (!selectedIds.includes(r.id)) return r;
      if (action === 'assign') return { ...r, owner: 'pod-escalations' };
      if (action === 'snooze') return { ...r, slaHoursRemaining: r.slaHoursRemaining + 24, stageUrgency: Math.max(0, r.stageUrgency - 15) };
      return { ...r, stageUrgency: Math.min(100, r.stageUrgency + 12), slaRisk: Math.min(100, r.slaRisk + 10) };
    };

    setPending(action);
    setFeedback(`${action} pending…`);
    setRecords((curr) => curr.map(applyOptimistic));

    try {
      if (onExecuteBulkAction) {
        await onExecuteBulkAction(action, selectedIds);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
      setFeedback(`${action} applied`);
      setSelectedIds([]);
    } catch (e) {
      setRecords(prev);
      setFeedback(`${action} failed; rollback complete`);
    } finally {
      setPending(null);
      setTimeout(() => setFeedback(null), 1200);
    }
  };

  if (loading) {
    return <section aria-busy='true' style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Smart Triage Workspace</h3><p style={{ color: '#6b7280' }}>Loading recruiter priority inbox…</p></section>;
  }

  if (error) {
    return <section role='alert' style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 12, padding: 16 }}><h3 style={{ margin: 0, color: '#991b1b' }}>Smart triage unavailable</h3><p style={{ color: '#7f1d1d' }}>{error}</p><button type='button' onClick={onRetry}>Retry</button></section>;
  }

  if (!records.length) {
    return <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Smart Triage Workspace</h3><p style={{ color: '#6b7280' }}>No candidates in recruiter priority inbox.</p></section>;
  }

  return (
    <section style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Recruiter Priority Inbox Smart Triage</h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>Rank actions by SLA risk, urgency, and projected conversion lift.</p>
          {partialCount > 0 && <p style={{ margin: '6px 0 0 0', color: '#9a3412', fontSize: 12 }}>Partial data: {partialCount} records missing full telemetry.</p>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{feedback ?? 'Ready'}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => runBulkAction('assign')} disabled={!selectedIds.length || !!pending} accessKey='a'>Assign</button>
            <button onClick={() => runBulkAction('snooze')} disabled={!selectedIds.length || !!pending} accessKey='s'>Snooze</button>
            <button onClick={() => runBulkAction('escalate')} disabled={!selectedIds.length || !!pending} accessKey='e'>Escalate</button>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, marginBottom: 14 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
            <label style={{ fontSize: 12 }}>Min Priority ({minRisk})
              <input type='range' min={0} max={100} value={minRisk} onChange={(e) => setMinRisk(Number(e.target.value))} />
            </label>
            <label style={{ fontSize: 12 }}>Stage
              <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value as 'all' | Stage)} style={{ width: '100%' }}>
                <option value='all'>All stages</option>
                {stageOrder.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 12 }}>Owner
              <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)} style={{ width: '100%' }}>
                {owners.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <button onClick={saveCurrentPreset}>Save preset</button>
          </div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 12, marginBottom: 8, color: '#374151' }}>Saved presets</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {savedPresets.map((p) => (
              <button key={p.id} onClick={() => applyPreset(p)} style={{ fontSize: 12 }}>{p.name}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}><input type='checkbox' checked={allVisibleSelected} onChange={toggleAllVisible} aria-label='Select visible' /></th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Candidate</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Stage</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>SLA (hrs)</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Priority</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Owner</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Rationale</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 16, color: '#6b7280' }}>No candidates match current filters.</td></tr>
            ) : filtered.map((r) => {
              const urgency = urgencyLabel(r.priorityScore);
              return (
                <React.Fragment key={r.id}>
                  <tr style={{ borderTop: '1px solid #e5e7eb', background: selectedIds.includes(r.id) ? '#eff6ff' : '#fff' }}>
                    <td style={{ padding: '10px 12px' }}><input type='checkbox' checked={selectedIds.includes(r.id)} onChange={() => setSelectedIds((ids) => ids.includes(r.id) ? ids.filter((id) => id !== r.id) : [...ids, r.id])} /></td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600 }}>{r.candidateName}</div>
                      <div style={{ color: '#6b7280', fontSize: 12 }}>{r.role} · {r.recruiter}</div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{r.stage}</td>
                    <td style={{ padding: '10px 12px', color: r.slaHoursRemaining < 0 ? '#b91c1c' : '#111827' }}>{r.slaHoursRemaining}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: urgencyColor[urgency], color: '#fff', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>
                        {r.priorityScore} · {urgency}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{r.owner}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <button onClick={() => setExpandedId((id) => id === r.id ? null : r.id)}>{expandedId === r.id ? 'Hide' : 'View'}</button>
                    </td>
                  </tr>
                  {expandedId === r.id && (
                    <tr>
                      <td colSpan={7} style={{ padding: 12, background: '#f8fafc', borderTop: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: 13, color: '#374151' }}>
                          <strong>Why ranked high:</strong> SLA risk {r.slaRisk}, stage urgency {r.stageUrgency}, expected lift {r.expectedConversionLift}.
                          {r.blockedBy ? ` Blocker: ${r.blockedBy}.` : ' No active blocker.'}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
