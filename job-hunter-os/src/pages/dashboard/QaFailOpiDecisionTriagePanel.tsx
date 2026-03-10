import React, { useState } from 'react';

type DecisionState = 'pending' | 'approved' | 'rejected';

type VerificationCheck = {
  id: string;
  behavior: string;
  expectedEvidence: string;
};

type Props = {
  taskId: string;
  qaTaskId: string;
  issueTitle: string;
  checksRequired: number;
  checks?: VerificationCheck[];
  onDecision?: (decision: Exclude<DecisionState, 'pending'>) => Promise<void> | void;
};

export const QaFailOpiDecisionTriagePanel: React.FC<Props> = ({ taskId, qaTaskId, issueTitle, checksRequired, checks = [], onDecision }) => {
  const [decision, setDecision] = useState<DecisionState>('pending');
  const [note, setNote] = useState('Waiting for OPI decision before execution.');

  const submit = async (next: Exclude<DecisionState, 'pending'>) => {
    setDecision(next);
    setNote(next === 'approved' ? 'OPI approved remediation. Bob can execute.' : 'OPI rejected remediation. Scope needs update.');
    if (onDecision) await onDecision(next);
  };

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: 20 }}>
      <h2 style={{ margin: 0, fontSize: 18 }}>QA FAIL Triage (OPI Decision Required)</h2>
      <p style={{ color: '#6b7280', fontSize: 14, marginTop: 6 }}>{issueTitle}</p>
      <div style={{ fontSize: 12, color: '#374151', display: 'grid', gap: 4, marginBottom: 10 }}>
        <div><strong>Task:</strong> {taskId}</div>
        <div><strong>QA Source:</strong> {qaTaskId}</div>
        <div><strong>Evidence gap:</strong> Missing reproducible mapping for {checksRequired}/{checksRequired} claimed checks</div>
      </div>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, marginBottom: 10, background: '#f9fafb' }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Required 6-check evidence map</div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12 }}>
          {checks.map((c) => (
            <li key={c.id}><strong>{c.id}</strong> {c.behavior} -> {c.expectedEvidence}</li>
          ))}
        </ul>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button onClick={() => submit('approved')}>Approve fix execution</button>
        <button onClick={() => submit('rejected')}>Reject and rescope</button>
      </div>
      <div aria-live='polite' style={{ fontSize: 12, color: decision === 'approved' ? '#166534' : decision === 'rejected' ? '#991b1b' : '#1e3a8a' }}>
        {note}
      </div>
    </section>
  );
};
