import React, { useMemo, useState } from 'react';

type ActionPriority = 'low' | 'medium' | 'high' | 'critical';

type DecisionAction = {
  id: string;
  title: string;
  owner: string;
  module: string;
  etaHours: number;
  expectedImpact: string;
  priority: ActionPriority;
  kpiDelta: number;
  status: 'open' | 'in_progress' | 'done';
};

type Props = {
  actions?: DecisionAction[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const priorityColor: Record<ActionPriority, string> = {
  low: '#65a30d',
  medium: '#d97706',
  high: '#ea580c',
  critical: '#b91c1c',
};

export const DashboardActionabilityUpgradeDecisionActions: React.FC<Props> = ({ actions = [], loading = false, error = null, onRetry }) => {
  const [state, setState] = useState(actions);
  const [statusMsg, setStatusMsg] = useState('Ready');
  const [priorityFilter, setPriorityFilter] = useState<'all' | ActionPriority>('all');

  const visible = useMemo(() => {
    return state
      .filter((a) => (priorityFilter === 'all' ? true : a.priority === priorityFilter))
      .sort((a, b) => b.kpiDelta - a.kpiDelta);
  }, [state, priorityFilter]);

  const activateAction = async (id: string) => {
    const before = state;
    setState((curr) => curr.map((a) => (a.id === id ? { ...a, status: 'in_progress' } : a)));
    setStatusMsg(`Action ${id} started…`);
    try {
      await new Promise((resolve) => setTimeout(resolve, 220));
      setStatusMsg(`Action ${id} in progress`);
    } catch {
      setState(before);
      setStatusMsg(`Action ${id} failed; rollback complete`);
    }
  };

  const markDone = async (id: string) => {
    const before = state;
    setState((curr) => curr.map((a) => (a.id === id ? { ...a, status: 'done' } : a)));
    setStatusMsg(`Closing ${id}…`);
    try {
      await new Promise((resolve) => setTimeout(resolve, 220));
      setStatusMsg(`Action ${id} completed`);
    } catch {
      setState(before);
      setStatusMsg(`Close ${id} failed; rollback complete`);
    }
  };

  const projectedKpiLift = visible.reduce((sum, a) => (a.status !== 'done' ? sum + a.kpiDelta : sum), 0);

  if (loading) return <section aria-busy='true' style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Dashboard Actionability Upgrade</h3><p style={{ color: '#6b7280' }}>Loading action queue…</p></section>;
  if (error) return <section role='alert' style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 12, padding: 16 }}><h3 style={{ margin: 0, color: '#991b1b' }}>Actionability upgrade unavailable</h3><p style={{ color: '#7f1d1d' }}>{error}</p><button onClick={onRetry}>Retry</button></section>;
  if (!actions.length) return <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Dashboard Actionability Upgrade</h3><p style={{ color: '#6b7280' }}>No decision actions found.</p></section>;

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Dashboard Actionability · Decision Actions</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#6b7280' }}>Upgrade static cards into operational actions with owner/ETA/KPI accountability.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as 'all' | ActionPriority)}>
            <option value='all'>All priorities</option>
            <option value='critical'>critical</option>
            <option value='high'>high</option>
            <option value='medium'>medium</option>
            <option value='low'>low</option>
          </select>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{statusMsg}</div>
        </div>
      </header>

      <div style={{ marginBottom: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ background: '#dbeafe', color: '#1e3a8a', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>Projected KPI lift +{projectedKpiLift}%</span>
        <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>Open actions {visible.filter((a) => a.status !== 'done').length}</span>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {visible.map((a) => (
          <article key={a.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, background: '#f9fafb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{a.module} · owner {a.owner} · ETA {a.etaHours}h</div>
              </div>
              <span style={{ background: priorityColor[a.priority], color: '#fff', borderRadius: 999, padding: '1px 8px', fontSize: 11 }}>{a.priority}</span>
            </div>
            <div style={{ fontSize: 12, color: '#374151', marginTop: 6 }}>{a.expectedImpact} (KPI +{a.kpiDelta}%)</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <button onClick={() => activateAction(a.id)} disabled={a.status === 'done'}>Start</button>
              <button onClick={() => markDone(a.id)} disabled={a.status !== 'in_progress'}>Mark done</button>
              <span style={{ fontSize: 12, color: '#6b7280', alignSelf: 'center' }}>status: {a.status}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
