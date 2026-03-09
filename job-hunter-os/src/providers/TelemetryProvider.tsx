import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

type TelemetryState = {
  connected: boolean;
  lastUpdated: number | null;
  error: string | null;
  metrics: Record<string, any>;
};

type TelemetryContextType = TelemetryState & {
  refresh: () => void;
};

const defaultState: TelemetryState = {
  connected: false,
  lastUpdated: null,
  error: null,
  metrics: {},
};

const TelemetryContext = createContext<TelemetryContextType>({
  ...defaultState,
  refresh: () => {},
});

export const useTelemetry = () => useContext(TelemetryContext);

type Props = {
  children: ReactNode;
  endpointUrl?: string;
  pollIntervalMs?: number;
};

export const TelemetryProvider: React.FC<Props> = ({
  children,
  endpointUrl = '/api/telemetry/stream',
  pollIntervalMs = 30000,
}) => {
  const [state, setState] = useState<TelemetryState>(defaultState);

  const fetchTelemetry = useCallback(async () => {
    try {
      // Stubbing fetch since actual API isn't present
      const response = await fetch(endpointUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setState({
        connected: true,
        lastUpdated: Date.now(),
        error: null,
        metrics: data,
      });
    } catch (err) {
      setState(s => ({
        ...s,
        connected: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
    }
  }, [endpointUrl]);

  useEffect(() => {
    // Initial fetch
    fetchTelemetry();

    // Setup polling
    const interval = setInterval(fetchTelemetry, pollIntervalMs);
    
    // Stub websocket connection for real-time overlay
    const ws = new WebSocket(endpointUrl.replace('http', 'ws'));
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setState(s => ({
          ...s,
          connected: true,
          lastUpdated: Date.now(),
          metrics: { ...s.metrics, ...payload },
          error: null
        }));
      } catch (e) {}
    };
    
    ws.onerror = () => {
      setState(s => ({ ...s, connected: false, error: 'Websocket error' }));
    };

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [fetchTelemetry, pollIntervalMs, endpointUrl]);

  return (
    <TelemetryContext.Provider value={{ ...state, refresh: fetchTelemetry }}>
      {state.error && (
        <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', padding: '8px 16px', color: '#991b1b', fontSize: '13px' }}>
          <strong>Telemetry Error:</strong> {state.error}
          <button onClick={fetchTelemetry} style={{ marginLeft: 12, background: 'none', border: '1px solid #fca5a5', borderRadius: 4, cursor: 'pointer' }}>Retry</button>
        </div>
      )}
      {children}
    </TelemetryContext.Provider>
  );
};
