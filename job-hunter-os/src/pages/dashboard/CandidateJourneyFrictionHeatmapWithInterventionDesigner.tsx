import React, { useMemo, useState } from 'react';

type Stage = 'applied' | 'screen' | 'interview' | 'offer' | 'close';
type Source = 'linkedin' | 'referral' | 'agency' | 'outbound';
type Role = 'Data Analyst' | 'Business Analyst' | 'Product Analyst' | 'Data Engineer';

type FrictionCell = {
  id: string;
  role: Role;
  source: Source;
  stage: Stage;
  volume: number;
  dropOffRate: number; // 0-100
  avgCycleDays: number;
  drivers: { label: string; impact: number }[];
  partial?: boolean;
};

type InterventionPlan = {
  timingShiftDays: number;
  owner: 'recruiter' | 'hiring_manager' | 'coordinator';
  intensity: number;
};

type Props = {
  data?: FrictionCell[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const stages: Stage[] = ['applied', 'screen', 'interview', 'offer', 'close'];
const stageLabel: Record<Stage, string> = {
  applied: 'Applied',
  screen: 'Screen',
  interview: 'Interview',
  offer: 'Offer',
  close: 'Close',
};

const heatColor = (drop: number) => {
  if (drop >= 45) return '#991b1b';
  if (drop >= 32) return '#dc2626';
  if (drop >= 20) return '#f59e0b';
  if (drop >= 10) return '#84cc16';
  return '#22c55e';
};

export const CandidateJourneyFrictionHeatmapWithInterventionDesigner: React.FC<Props> = ({
  data = [],
  loading = false,
  error = null,
  onRetry,
}) => {
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | Source>('all');
  const [selectedStage, setSelectedStage] = useState<Stage>('screen');
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);

  const [plan, setPlan] = useState<InterventionPlan>({ timingShiftDays: 2, owner: 'recruiter', intensity: 55 });

  const filtered = useMemo(
    () => data
      .filter((d) => (roleFilter === 'all' ? true : d.role === roleFilter))
      .filter((d) => (sourceFilter === 'all' ? true : d.source === sourceFilter)),
    [data, roleFilter, sourceFilter],
  );

  const roles = useMemo(() => ['all', ...Array.from(new Set(data.map((d) => d.role))).sort()] as const, [data]);
  const sources = useMemo(() => ['all', ...Array.from(new Set(data.map((d) => d.source))).sort()] as const, [data]);

  const matrix = useMemo(() => {
    const out: Record<string, Partial<Record<Stage, FrictionCell>>> = {};
    for (const row of filtered) {
      const key = `${row.role}::${row.source}`;
      if (!out[key]) out[key] = {};
      out[key][row.stage] = row;
    }
    return out;
  }, [filtered]);

  const keys = Object.keys(matrix).sort();
  const selected = useMemo(
    () => filtered.find((d) => d.id === selectedCellId) ?? filtered.find((d) => d.stage === selectedStage) ?? filtered[0] ?? null,
    [filtered, selectedCellId, selectedStage],
  );

  const projection = useMemo(() => {
    if (!selected) return null;
    const timingGain = Math.max(0, 5 - plan.timingShiftDays) * 1.8;
    const ownerFactor = plan.owner === 'hiring_manager' ? 1.1 : plan.owner === 'coordinator' ? 0.85 : 1;
    const intensityFactor = plan.intensity / 100;

    const conversionLift = Number((Math.min(18, (selected.dropOffRate * 0.22 + timingGain) * ownerFactor * intensityFactor)).toFixed(1));
    const cycleTimeRecovery = Number((Math.min(9, (selected.avgCycleDays * 0.16 + timingGain * 0.6) * intensityFactor)).toFixed(1));

    return {
      conversionLift,
      cycleTimeRecovery,
      projectedDropOff: Number(Math.max(1, selected.dropOffRate - conversionLift).toFixed(1)),
      projectedCycleDays: Number(Math.max(1, selected.avgCycleDays - cycleTimeRecovery).toFixed(1)),
    };
  }, [selected, plan]);

  if (loading) return <section aria-busy='true' style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Candidate Journey Friction Heatmap</h3><p style={{ color: '#6b7280' }}>Loading journey telemetry…</p></section>;
  if (error) return <section role='alert' style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 12, padding: 16 }}><h3 style={{ margin: 0, color: '#991b1b' }}>Friction heatmap unavailable</h3><p style={{ color: '#7f1d1d' }}>{error}</p><button type='button' onClick={onRetry}>Retry</button></section>;
  if (!data.length) return <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Candidate Journey Friction Heatmap</h3><p style={{ color: '#6b7280' }}>No journey telemetry available.</p></section>;

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Candidate Journey Friction Heatmap</h2>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>Track stage drop-off intensity by role and source with intervention what-if design.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as 'all' | Role)}>
            {roles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as 'all' | Source)}>
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={selectedStage} onChange={(e) => setSelectedStage(e.target.value as Stage)}>
            {stages.map((s) => <option key={s} value={s}>{stageLabel[s]}</option>)}
          </select>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 12px' }}>Role / Source</th>
                {stages.map((s) => <th key={s} style={{ textAlign: 'left', padding: '10px 12px' }}>{stageLabel[s]}</th>)}
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => {
                const [role, source] = key.split('::');
                return (
                  <tr key={key} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600 }}>{role}</div>
                      <div style={{ color: '#6b7280' }}>{source}</div>
                    </td>
                    {stages.map((s) => {
                      const c = matrix[key][s];
                      if (!c) return <td key={s} style={{ padding: '10px 12px', color: '#9ca3af' }}>—</td>;
                      const active = selectedCellId === c.id;
                      return (
                        <td key={s} style={{ padding: '10px 12px' }}>
                          <button
                            onClick={() => setSelectedCellId(c.id)}
                            style={{
                              width: '100%',
                              border: active ? '2px solid #1d4ed8' : '1px solid #d1d5db',
                              borderRadius: 8,
                              padding: '6px 8px',
                              background: heatColor(c.dropOffRate),
                              color: '#fff',
                              cursor: 'pointer',
                            }}
                          >
                            {c.dropOffRate}%
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <aside style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, background: '#f8fafc' }}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>Intervention Designer</h3>
          {selected ? (
            <>
              <div style={{ marginBottom: 10, fontSize: 13 }}>
                <strong>{selected.role}</strong> · {selected.source} · {stageLabel[selected.stage]}
                {selected.partial && <div style={{ color: '#9a3412', marginTop: 4 }}>Partial telemetry in this cell.</div>}
              </div>

              <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
                <label style={{ fontSize: 12 }}>Timing shift (days)
                  <input type='range' min={0} max={7} value={plan.timingShiftDays} onChange={(e) => setPlan((p) => ({ ...p, timingShiftDays: Number(e.target.value) }))} />
                </label>
                <label style={{ fontSize: 12 }}>Owner
                  <select value={plan.owner} onChange={(e) => setPlan((p) => ({ ...p, owner: e.target.value as InterventionPlan['owner'] }))}>
                    <option value='recruiter'>Recruiter</option>
                    <option value='hiring_manager'>Hiring Manager</option>
                    <option value='coordinator'>Coordinator</option>
                  </select>
                </label>
                <label style={{ fontSize: 12 }}>Intervention intensity ({plan.intensity})
                  <input type='range' min={20} max={100} value={plan.intensity} onChange={(e) => setPlan((p) => ({ ...p, intensity: Number(e.target.value) }))} />
                </label>
              </div>

              {projection && (
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>+{projection.conversionLift}% conversion</span>
                    <span style={{ background: '#dbeafe', color: '#1e3a8a', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>-{projection.cycleTimeRecovery}d cycle</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#374151' }}>
                    Projected drop-off: <strong>{projection.projectedDropOff}%</strong> · Projected cycle time: <strong>{projection.projectedCycleDays}d</strong>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Friction drivers</div>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#374151' }}>
                  {selected.drivers.map((d) => <li key={d.label}>{d.label} ({d.impact}%)</li>)}
                </ul>
              </div>
            </>
          ) : (
            <p style={{ color: '#6b7280', fontSize: 13 }}>Select a heatmap cell to design interventions.</p>
          )}
        </aside>
      </div>
    </section>
  );
};
