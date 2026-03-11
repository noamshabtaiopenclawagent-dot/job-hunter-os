import React, { useMemo, useState } from 'react';

type SubmitState = 'idle' | 'pending' | 'success' | 'error';

type ChecklistState = {
  requiredFieldsComplete: boolean;
  interviewNotesAttached: boolean;
  blockersResolved: boolean;
};

type Props = {
  initialOpen?: boolean;
  simulateError?: boolean;
};

const initialChecklist: ChecklistState = {
  requiredFieldsComplete: false,
  interviewNotesAttached: false,
  blockersResolved: false,
};

export const PipelineHandoffReadinessChecklistDrawer: React.FC<Props> = ({
  initialOpen = true,
  simulateError = false,
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [checklist, setChecklist] = useState<ChecklistState>(initialChecklist);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const allReady = useMemo(
    () => checklist.requiredFieldsComplete && checklist.interviewNotesAttached && checklist.blockersResolved,
    [checklist],
  );

  const toggleItem = (key: keyof ChecklistState) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
    setValidationMessage(null);
    if (submitState !== 'idle') {
      setSubmitState('idle');
    }
  };

  const submitChecklist = async () => {
    if (!allReady) {
      setValidationMessage('Resolve required fields, interview notes, and blockers before handoff.');
      return;
    }

    setValidationMessage(null);
    setSubmitState('pending');

    await new Promise((resolve) => setTimeout(resolve, 200));

    if (simulateError) {
      setSubmitState('error');
      return;
    }

    setSubmitState('success');
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLElement> = async (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      await submitChecklist();
    }
  };

  return (
    <section>
      <h3>Pipeline Handoff Readiness Checklist Drawer</h3>
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} aria-label="Open Handoff Drawer">Open Handoff Drawer</button>
      ) : (
        <div
          role="dialog"
          aria-label="Pipeline Handoff Readiness Drawer"
          tabIndex={0}
          onKeyDown={onKeyDown}
          style={{ border: '1px solid #d1d5db', borderRadius: 10, padding: 16, maxWidth: 620 }}
        >
          <p style={{ marginTop: 0, color: '#4b5563' }}>
            Confirm all handoff gates before pushing candidate pipeline ownership.
          </p>

          <div style={{ display: 'grid', gap: 10 }}>
            <label>
              <input
                type="checkbox"
                checked={checklist.requiredFieldsComplete}
                onChange={() => toggleItem('requiredFieldsComplete')}
              />{' '}
              Required fields complete
            </label>
            <label>
              <input
                type="checkbox"
                checked={checklist.interviewNotesAttached}
                onChange={() => toggleItem('interviewNotesAttached')}
              />{' '}
              Interview notes attached
            </label>
            <label>
              <input
                type="checkbox"
                checked={checklist.blockersResolved}
                onChange={() => toggleItem('blockersResolved')}
              />{' '}
              Blockers resolved
            </label>
          </div>

          {validationMessage && (
            <p style={{ color: '#991b1b', marginBottom: 0 }}>{validationMessage}</p>
          )}

          {submitState === 'pending' && <p style={{ color: '#1d4ed8' }}>Submitting handoff checklist...</p>}
          {submitState === 'success' && <p style={{ color: '#166534' }}>Handoff checklist submitted successfully.</p>}
          {submitState === 'error' && <p style={{ color: '#991b1b' }}>Handoff submission failed. Retry in a moment.</p>}

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => setIsOpen(false)} aria-label="Close Handoff Drawer">Close</button>
            <button onClick={() => void submitChecklist()} aria-label="Submit Handoff Checklist">
              Submit Checklist
            </button>
          </div>

          <p style={{ marginBottom: 0, marginTop: 10, fontSize: 12, color: '#6b7280' }}>
            Keyboard: <code>Esc</code> closes drawer, <code>Cmd/Ctrl + Enter</code> submits.
          </p>
        </div>
      )}
    </section>
  );
};
