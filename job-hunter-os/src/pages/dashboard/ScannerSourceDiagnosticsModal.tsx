import React, { useMemo, useState } from 'react';

type FailureMeta = { key: string; value: string };
type DiagnosticSource = {
  id: string;
  source: string;
  latencySeries: number[];
  failureMeta: FailureMeta[];
  status: 'loading' | 'ready' | 'empty' | 'error';
};

type Props = {
  open?: boolean;
  source?: DiagnosticSource | null;
  onClose?: () => void;
  onRetry?: () => void;
  onPause?: () => void;
  onReport?: () => void;
};

export const ScannerSourceDiagnosticsModal: React.FC<Props> = ({ open = false, source = null, onClose, onRetry, onPause, onReport }) => {
  const [focusIndex, setFocusIndex] = useState(0);
  const focusables = ['retry', 'pause', 'report', 'close'];

  const sparklinePoints = useMemo(() => {
    if (!source?.latencySeries?.length) return '';
    const max = Math.max(...source.latencySeries, 1);
    return source.latencySeries.map((v, i) => `${(i / Math.max(1, source.latencySeries.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ');
  }, [source]);

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Escape') {
      onClose?.();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const next = e.shiftKey ? (focusIndex - 1 + focusables.length) % focusables.length : (focusIndex + 1) % focusables.length;
      setFocusIndex(next);
    }
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" onKeyDown={handleKeyDown} style={{ border: '1px solid #d1d5db', borderRadius: 12, background: '#fff', padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Scanner Source Diagnostics</h3>
      <div aria-live="polite" style={{ fontSize: 12, color: '#1e3a8a', marginBottom: 8 }}>Focus trap index: {focusIndex + 1}/{focusables.length}</div>

      {source?.status === 'loading' && <p>Loading diagnostics…</p>}
      {source?.status === 'empty' && <p>No diagnostics available.</p>}
      {source?.status === 'error' && <p style={{ color: '#991b1b' }}>Diagnostics unavailable.</p>}

      {source?.status === 'ready' && (
        <>
          <div style={{ marginBottom: 8 }}><strong>Source:</strong> {source.source}</div>
          <div style={{ marginBottom: 8 }}>
            <strong>Failure metadata</strong>
            <ul style={{ margin: '4px 0 0 16px' }}>
              {source.failureMeta.map((m) => <li key={m.key}>{m.key}: {m.value}</li>)}
            </ul>
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Latency sparkline</strong>
            <svg viewBox="0 0 100 100" width="220" height="60" aria-label="latency-sparkline">
              <polyline fill="none" stroke="#2563eb" strokeWidth="2" points={sparklinePoints} />
            </svg>
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button autoFocus={focusIndex === 0} onClick={onRetry}>Retry</button>
        <button autoFocus={focusIndex === 1} onClick={onPause}>Pause</button>
        <button autoFocus={focusIndex === 2} onClick={onReport}>Report</button>
        <button autoFocus={focusIndex === 3} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
