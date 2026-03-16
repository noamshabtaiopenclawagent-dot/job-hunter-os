import React, { useState } from 'react';
import { ReviewBacklogCleanupEvidenceConsole } from './ReviewBacklogCleanupEvidenceConsole';
import { QaFailOpiDecisionTriagePanel } from './QaFailOpiDecisionTriagePanel';

type Props = {
  tasks: any[];
  hasQaFail?: boolean;
};

export const ReviewBacklogCleanupEvidenceConsoleWithTriage: React.FC<Props> = ({ tasks, hasQaFail = true }) => {
  const [triageResolved, setTriageResolved] = useState(false);

  if (hasQaFail && !triageResolved) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ border: '2px solid #ef4444', borderRadius: 12, padding: 16, background: '#fef2f2' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#991b1b', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🛑</span> Execution Blocked by QA Failure
          </h3>
          <QaFailOpiDecisionTriagePanel 
            taskId="1e6582b8-52d1-46df-8fcb-8b51a6ecd148" 
            qaTaskId="2e607d36-c926-48fb-9da5-1718db62954d" 
            issueTitle="[JHOS-P1] Review backlog cleanup: close verified review tasks with evidence" 
            checksRequired={2} 
            risk="medium" 
            checks={[
              { id: 'C1', behavior: 'Contract fields rendered', expectedEvidence: 'artifact, integration, kpi proof rendered', kpi: 'contract validation' },
              { id: 'C2', behavior: 'Task close execution', expectedEvidence: 'successful api or state rollback on close', kpi: 'action reliability' },
            ]} 
            onDecision={async (decision) => {
              if (decision === 'approved') {
                setTriageResolved(true);
              }
            }} 
          />
        </div>
        <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
          <ReviewBacklogCleanupEvidenceConsole tasks={tasks} />
        </div>
      </div>
    );
  }

  return <ReviewBacklogCleanupEvidenceConsole tasks={tasks} />;
};
