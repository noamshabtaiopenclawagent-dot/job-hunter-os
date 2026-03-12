import React, { useEffect, useMemo, useState } from 'react';

type Severity = 'critical' | 'high' | 'medium';

type OutageIncident = {
  id: string;
  severity: Severity;
  impactedSources: number;
  message: string;
};

type Props = {
  incident?: OutageIncident | null;
  autoDismissMs?: number;
  onRetry?: () => void;
  onOpenDiagnostics?: () => void;
};

const severityColor: Record<Severity, string> = {
  critical: '#991b1b',
  high: '#b45309',
  medium: '#1d4ed8',
};

const DISMISS_KEY = 'jhos:scanner-outage:dismissed';

export const ScannerOutageIncidentBanner: React.FC<Props> = ({
  incident = { id: 'outage-1', severity: 'high', impactedSources: 3, message: 'Scanner outage detected across source adapters.' },
  autoDismissMs = 6000,
  onRetry,
  onOpenDiagnostics,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [snoozed, setSnoozed] = useState(false);

  useEffect(() => {
    const persisted = sessionStorage.getItem(DISMISS_KEY);
    if (persisted === incident?.id) setDismissed(true);
  }, [incident?.id]);

  useEffect(() => {
    if (!incident || dismissed || snoozed) return;
    const t = window.setTimeout(() => setDismissed(true), autoDismissMs);
    return () => window.clearTimeout(t);
  }, [incident, dismissed, snoozed, autoDismissMs]);

  const visible = useMemo(() => Boolean(incident) && !dismissed && !snoozed, [incident, dismissed, snoozed]);

  const dismiss = () => {
    if (!incident) return;
    sessionStorage.setItem(DISMISS_KEY, incident.id);
    setDismissed(true);
  };

  if (!visible || !incident) return null;

  return (
    <section
      aria-label="Scanner outage incident banner"
      style={{
        border: `1px solid ${severityColor[incident.severity]}`,
        borderRadius: 12,
        padding: 14,
        background: '#fff',
        display: 'grid',
        gap: 10,
      }}
    >
      <strong style={{ color: severityColor[incident.severity] }}>
        {incident.severity.toUpperCase()} Scanner Outage
      </strong>
      <div>{incident.message}</div>
      <div>Impacted sources: {incident.impactedSources}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={onRetry}>Retry</button>
        <button onClick={onOpenDiagnostics}>Open Diagnostics</button>
        <button onClick={() => setSnoozed(true)}>Snooze</button>
        <button onClick={dismiss}>Dismiss</button>
      </div>
    </section>
  );
};
