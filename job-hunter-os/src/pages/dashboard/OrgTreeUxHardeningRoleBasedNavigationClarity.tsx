import React, { useEffect, useMemo, useState } from 'react';

type OrgRole = 'lead' | 'recruiter' | 'analyst' | 'coordinator';

type OrgNode = {
  id: string;
  name: string;
  role: OrgRole;
  parentId: string | null;
  active: boolean;
  workload: number;
  approvalsPending?: number;
  slaRisk?: number;
};

type LiveSignal = {
  nodeId: string;
  approvalsPending: number;
  slaRisk: number;
  validatedAt: string;
};

type Props = {
  nodes?: OrgNode[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  signalsEndpoint?: string;
  liveSignalsSnapshot?: LiveSignal[];
};

const roleColor: Record<OrgRole, string> = {
  lead: '#1d4ed8',
  recruiter: '#15803d',
  analyst: '#7c3aed',
  coordinator: '#b45309',
};

const roleNav: Record<OrgRole, string[]> = {
  lead: ['Roadmap Artifact Mapping', 'Review Backlog Cleanup', 'Dashboard Actionability', 'Org Tree UX'],
  recruiter: ['Priority Inbox Smart Triage', 'Offer Decision Collaboration', 'Journey Friction Heatmap'],
  analyst: ['CV-JD Calibration', 'Sourcing Velocity Radar', 'Israel Source Hardening'],
  coordinator: ['Review Backlog Cleanup', 'Israel Source Hardening', 'Dashboard Actionability'],
};

export const OrgTreeUxHardeningRoleBasedNavigationClarity: React.FC<Props> = ({ nodes = [], loading = false, error = null, onRetry, signalsEndpoint = '/api/org-tree/risk-signals', liveSignalsSnapshot = [] }) => {
  const [roleFilter, setRoleFilter] = useState<'all' | OrgRole>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [liveSignals, setLiveSignals] = useState<LiveSignal[]>(liveSignalsSnapshot);
  const [validationNote, setValidationNote] = useState<string>('Using baseline signals');

  useEffect(() => {
    if (liveSignalsSnapshot.length) {
      setValidationNote('Using injected live-signal snapshot');
      return;
    }

    let mounted = true;
    fetch(signalsEndpoint)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((payload) => {
        if (!mounted) return;
        const items = Array.isArray(payload?.items) ? payload.items : [];
        setLiveSignals(items);
        setValidationNote(items.length ? 'Live org-task API signals validated' : 'No live signals returned');
      })
      .catch(() => {
        if (!mounted) return;
        setValidationNote('Live signal fetch failed; fallback values applied');
      });

    return () => {
      mounted = false;
    };
  }, [signalsEndpoint, liveSignalsSnapshot]);

  const enrichedNodes = useMemo(() => {
    const map = new Map(liveSignals.map((s) => [s.nodeId, s]));
    return nodes.map((n) => {
      const live = map.get(n.id);
      return live ? { ...n, approvalsPending: live.approvalsPending, slaRisk: live.slaRisk } : n;
    });
  }, [nodes, liveSignals]);

  const filtered = useMemo(() => {
    return enrichedNodes
      .filter((n) => (roleFilter === 'all' ? true : n.role === roleFilter))
      .sort((a, b) => (a.parentId === null ? -1 : 1) - (b.parentId === null ? -1 : 1));
  }, [enrichedNodes, roleFilter]);

  const selected = filtered.find((n) => n.id === selectedId) ?? filtered[0] ?? null;

  const parentMap = useMemo(() => {
    const map = new Map<string, OrgNode[]>();
    filtered.forEach((n) => {
      const key = n.parentId ?? 'root';
      const arr = map.get(key) ?? [];
      arr.push(n);
      map.set(key, arr);
    });
    return map;
  }, [filtered]);

  if (loading) return <section aria-busy='true' style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Org Tree UX Hardening</h3><p style={{ color: '#6b7280' }}>Loading org-tree…</p></section>;
  if (error) return <section role='alert' style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 12, padding: 16 }}><h3 style={{ margin: 0, color: '#991b1b' }}>Org tree unavailable</h3><p style={{ color: '#7f1d1d' }}>{error}</p><button onClick={onRetry}>Retry</button></section>;
  if (!nodes.length) return <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Org Tree UX Hardening</h3><p style={{ color: '#6b7280' }}>No org-tree nodes loaded.</p></section>;

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Org Tree UX Hardening</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#6b7280' }}>Clarifies reporting lines and role-based navigation pathways.</p>
          <div style={{ marginTop: 6, fontSize: 12, color: '#1e3a8a' }}>{validationNote}</div>
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as 'all' | OrgRole)}>
          <option value='all'>All roles</option>
          <option value='lead'>lead</option>
          <option value='recruiter'>recruiter</option>
          <option value='analyst'>analyst</option>
          <option value='coordinator'>coordinator</option>
        </select>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Hierarchy</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {(parentMap.get('root') ?? []).map((root) => (
              <div key={root.id}>
                <button onClick={() => setSelectedId(root.id)} style={{ width: '100%', textAlign: 'left', border: selected?.id === root.id ? '2px solid #2563eb' : '1px solid #e5e7eb', borderRadius: 8, padding: 8, background: '#fff' }}>
                  <div style={{ fontWeight: 600 }}>{root.name}</div>
                  <div style={{ fontSize: 12, color: roleColor[root.role] }}>{root.role}</div>
                </button>
                <div style={{ marginLeft: 18, marginTop: 6, display: 'grid', gap: 6 }}>
                  {(parentMap.get(root.id) ?? []).map((child) => (
                    <button key={child.id} onClick={() => setSelectedId(child.id)} style={{ textAlign: 'left', border: selected?.id === child.id ? '2px solid #2563eb' : '1px solid #e5e7eb', borderRadius: 8, padding: 8, background: '#f9fafb' }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{child.name}</div>
                      <div style={{ fontSize: 12, color: roleColor[child.role] }}>{child.role} · workload {child.workload}%</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, background: '#f8fafc' }}>
          <h3 style={{ marginTop: 0, fontSize: 14 }}>Role-based Navigation Clarity</h3>
          {selected ? (
            <div style={{ fontSize: 12, color: '#374151' }}>
              <div><strong>Selected:</strong> {selected.name} ({selected.role})</div>
              <div style={{ marginTop: 6 }}><strong>Suggested modules:</strong></div>
              <ul style={{ margin: '4px 0 0 16px' }}>
                {roleNav[selected.role].map((item) => <li key={item}>{item}</li>)}
              </ul>
              <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ background: selected.active ? '#dcfce7' : '#fee2e2', color: selected.active ? '#166534' : '#991b1b', borderRadius: 999, padding: '2px 8px', fontSize: 11 }}>
                  {selected.active ? 'active node' : 'inactive node'}
                </span>
                <span style={{ background: '#dbeafe', color: '#1e3a8a', borderRadius: 999, padding: '2px 8px', fontSize: 11 }}>
                  approvals pending: {selected.approvalsPending ?? 0}
                </span>
                <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: 999, padding: '2px 8px', fontSize: 11 }}>
                  SLA risk: {selected.slaRisk ?? 0}%
                </span>
              </div>
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontSize: 12 }}>Select a node for role-based navigation guidance.</p>
          )}
        </aside>
      </div>
    </section>
  );
};
