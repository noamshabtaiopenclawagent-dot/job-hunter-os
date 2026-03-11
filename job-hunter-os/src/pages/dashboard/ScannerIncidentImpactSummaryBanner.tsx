import React, { useMemo, useState } from 'react';

type Severity = 'low' | 'medium' | 'high' | 'critical';

type IncidentImpact = {
  id: string;
  severity: Severity;
  affectedRoles: number;
  impactedCandidates: number;
};

type Props = {
  loading?: boolean;
  error?: string | null;
  incidents?: IncidentImpact[];
};

const defaultIncidents: IncidentImpact[] = [
  { id: 'inc-501', severity: 'critical', affectedRoles: 3, impactedCandidates: 21 },
  { id: 'inc-502', severity: 'high', affectedRoles: 2, impactedCandidates: 13 },
];

export const ScannerIncidentImpactSummaryBanner: React.FC<Props> = ({
  loading = false,
  error = null,
  incidents = defaultIncidents,
}) => {
  const [isDiagnosticsPending, setDiagnosticsPending] = useState(false);
  const [isRecoveryPending, setRecoveryPending] = useState(false);
  const [isDismissed, setDismissed] = useState(false);
  const [isSnoozed, setSnoozed] = useState(false);

  const summary = useMemo(() => {
    const severityRank: Record<Severity, number> = { low: 1, medium: 2, high: 3, critical: 4 };
    const highest = incidents.reduce<Severity>((acc, curr) => (severityRank[curr.severity] > severityRank[acc] ? curr.severity : acc), 'low');
    const affectedRoles = incidents.reduce((acc, curr) => acc + curr.affectedRoles, 0);
    const impactedCandidates = incidents.reduce((acc, curr) => acc + curr.impactedCandidates, 0);
    return { highest, affectedRoles, impactedCandidates };
  }, [incidents]);

  const runAction = async (kind: 'diagnostics' | 'recovery') => {
    if (kind === 'diagnostics') setDiagnosticsPending(true);
    if (kind === 'recovery') setRecoveryPending(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    if (kind === 'diagnostics') setDiagnosticsPending(false);
    if (kind === 'recovery') setRecoveryPending(false);
  };

  if (loading) return <p>Loading scanner incident summary...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!incidents.length) return <p>No active scanner incidents.</p>;
  if (isDismissed) return <p>Incident banner dismissed.</p>;

  return (
    <section style={{ border: '1px solid #fca5a5', borderRadius: 10, background: '#fff1f2', padding: 14 }}>
      <h3 style={{ marginTop: 0 }}>Scanner Incident Impact Summary Banner</h3>
      <p style={{ marginTop: 0 }}>
        Highest severity: <strong>{summary.highest.toUpperCase()}</strong> • Affected roles: <strong>{summary.affectedRoles}</strong> • Impacted candidates: <strong>{summary.impactedCandidates}</strong>
      </p>

      {isSnoozed && <p style={{ color: '#92400e' }}>Banner snoozed for 30 minutes.</p>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => void runAction('diagnostics')} aria-label="Run Diagnostics">
          {isDiagnosticsPending ? 'Running diagnostics...' : 'Run Diagnostics'}
        </button>
        <button onClick={() => void runAction('recovery')} aria-label="Run Recovery Actions">
          {isRecoveryPending ? 'Applying recovery...' : 'Run Recovery Actions'}
        </button>
        <button onClick={() => setSnoozed(true)} aria-label="Snooze Banner">Snooze</button>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss Banner">Dismiss</button>
      </div>
    </section>
  );
};
