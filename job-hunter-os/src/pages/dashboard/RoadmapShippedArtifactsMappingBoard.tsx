import React, { useMemo, useState } from 'react';

type RoadmapStage = 'phase-0' | 'phase-1' | 'phase-2' | 'phase-3';

type ArtifactMapping = {
  id: string;
  name: string;
  path: string;
  stage: RoadmapStage;
  status: 'mapped' | 'pending_validation' | 'ready_reuse';
  integrationDelta: string;
  kpiProof: string;
  reusableOutputs: string[];
};

type Props = {
  items?: ArtifactMapping[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const stageLabel: Record<RoadmapStage, string> = {
  'phase-0': 'Phase 0 · Approval/Alignment',
  'phase-1': 'Phase 1 · Core Workflow',
  'phase-2': 'Phase 2 · Intelligence Layer',
  'phase-3': 'Phase 3 · Scale/Automation',
};

const statusColor: Record<ArtifactMapping['status'], string> = {
  mapped: '#1d4ed8',
  pending_validation: '#b45309',
  ready_reuse: '#15803d',
};

export const RoadmapShippedArtifactsMappingBoard: React.FC<Props> = ({
  items = [],
  loading = false,
  error = null,
  onRetry,
}) => {
  const [stageFilter, setStageFilter] = useState<'all' | RoadmapStage>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ArtifactMapping['status']>('all');
  const [activeId, setActiveId] = useState<string | null>(null);

  const filtered = useMemo(
    () => items
      .filter((i) => (stageFilter === 'all' ? true : i.stage === stageFilter))
      .filter((i) => (statusFilter === 'all' ? true : i.status === statusFilter)),
    [items, stageFilter, statusFilter],
  );

  const grouped = useMemo(() => {
    return filtered.reduce<Record<RoadmapStage, ArtifactMapping[]>>(
      (acc, item) => {
        acc[item.stage].push(item);
        return acc;
      },
      { 'phase-0': [], 'phase-1': [], 'phase-2': [], 'phase-3': [] },
    );
  }, [filtered]);

  const selected = filtered.find((i) => i.id === activeId) ?? filtered[0] ?? null;

  if (loading) return <section aria-busy='true' style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Roadmap Artifact Mapping</h3><p style={{ color: '#6b7280' }}>Loading roadmap mappings…</p></section>;
  if (error) return <section role='alert' style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 12, padding: 16 }}><h3 style={{ margin: 0, color: '#991b1b' }}>Mapping board unavailable</h3><p style={{ color: '#7f1d1d' }}>{error}</p><button type='button' onClick={onRetry}>Retry</button></section>;
  if (!items.length) return <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Roadmap Artifact Mapping</h3><p style={{ color: '#6b7280' }}>No shipped artifact mappings found.</p></section>;

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Roadmap Mapping · Shipped Artifacts</h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>Maps delivered slices to roadmap phases and preserves reusable outputs for auto-next execution.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value as 'all' | RoadmapStage)}>
            <option value='all'>All phases</option>
            <option value='phase-0'>Phase 0</option>
            <option value='phase-1'>Phase 1</option>
            <option value='phase-2'>Phase 2</option>
            <option value='phase-3'>Phase 3</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | ArtifactMapping['status'])}>
            <option value='all'>All statuses</option>
            <option value='mapped'>mapped</option>
            <option value='pending_validation'>pending_validation</option>
            <option value='ready_reuse'>ready_reuse</option>
          </select>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
        <div style={{ display: 'grid', gap: 10 }}>
          {(Object.keys(stageLabel) as RoadmapStage[]).map((stage) => (
            <div key={stage} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{stageLabel[stage]} ({grouped[stage].length})</div>
              <div style={{ display: 'grid', gap: 6 }}>
                {grouped[stage].length === 0 ? (
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>No artifacts in this phase.</div>
                ) : grouped[stage].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveId(item.id)}
                    style={{
                      textAlign: 'left',
                      border: activeId === item.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                      borderRadius: 8,
                      padding: 8,
                      background: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{item.path}</div>
                    <div style={{ marginTop: 4 }}>
                      <span style={{ background: statusColor[item.status], color: '#fff', borderRadius: 999, padding: '1px 8px', fontSize: 11 }}>{item.status}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#f8fafc' }}>
          <h3 style={{ marginTop: 0, fontSize: 14 }}>Execution Contract View</h3>
          {selected ? (
            <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
              <div><strong>Artifact(path):</strong> {selected.path}</div>
              <div><strong>Integration delta:</strong> {selected.integrationDelta}</div>
              <div><strong>KPI proof:</strong> {selected.kpiProof}</div>
              <div>
                <strong>Reusable outputs:</strong>
                <ul style={{ margin: '4px 0 0 16px' }}>
                  {selected.reusableOutputs.map((r) => <li key={r}>{r}</li>)}
                </ul>
              </div>
              <div><strong>Next ETA:</strong> 45m for API wiring/calibration pass after approval</div>
            </div>
          ) : (
            <p style={{ fontSize: 12, color: '#6b7280' }}>Select an artifact to inspect contract details.</p>
          )}
        </aside>
      </div>
    </section>
  );
};
