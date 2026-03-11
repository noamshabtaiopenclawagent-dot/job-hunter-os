import React, { useState } from 'react';

type SubmitState = 'idle' | 'pending' | 'success' | 'error';

type Props = {
  open?: boolean;
  simulateError?: boolean;
};

export const StageTransitionApprovalCheckpointModal: React.FC<Props> = ({ open = true, simulateError = false }) => {
  const [isOpen, setIsOpen] = useState(open);
  const [approver, setApprover] = useState('');
  const [rationale, setRationale] = useState('');
  const [blockersCleared, setBlockersCleared] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [validation, setValidation] = useState<string | null>(null);

  const validate = () => {
    if (!approver) return 'Approver is required.';
    if (rationale.trim().length < 12) return 'Rationale must be at least 12 characters.';
    if (!blockersCleared) return 'Confirm blocker checklist before submit.';
    return null;
  };

  const submit = async () => {
    const error = validate();
    if (error) {
      setValidation(error);
      return;
    }
    setValidation(null);
    setSubmitState('pending');
    await new Promise((r) => setTimeout(r, 200));
    setSubmitState(simulateError ? 'error' : 'success');
  };

  if (!isOpen) return <button onClick={() => setIsOpen(true)}>Open Approval Checkpoint</button>;

  return (
    <section
      role="dialog"
      aria-label="Stage Transition Approval Checkpoint"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
          e.preventDefault();
          void submit();
        }
      }}
      style={{ border: '1px solid #d1d5db', borderRadius: 10, padding: 16, maxWidth: 680 }}
    >
      <h3 style={{ marginTop: 0 }}>Stage Transition Approval Checkpoint Modal</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
        <label>
          Approver
          <select aria-label="Approver" value={approver} onChange={(e) => setApprover(e.target.value)}>
            <option value="">Select approver</option>
            <option value="lead">Lead Recruiter</option>
            <option value="ops">Ops Manager</option>
          </select>
        </label>
        <label>
          Rationale
          <textarea aria-label="Rationale" value={rationale} onChange={(e) => setRationale(e.target.value)} />
        </label>
      </div>

      <label style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input type="checkbox" checked={blockersCleared} onChange={() => setBlockersCleared((v) => !v)} />
        Blocker checklist reviewed and cleared
      </label>

      {validation && <p style={{ color: '#991b1b' }}>{validation}</p>}
      {submitState === 'pending' && <p style={{ color: '#1d4ed8' }}>Submitting checkpoint...</p>}
      {submitState === 'success' && <p style={{ color: '#166534' }}>Approval checkpoint submitted.</p>}
      {submitState === 'error' && <p style={{ color: '#991b1b' }}>Submission failed. Please retry.</p>}

      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button onClick={() => setIsOpen(false)}>Close</button>
        <button onClick={() => void submit()}>Submit Checkpoint</button>
      </div>
    </section>
  );
};
