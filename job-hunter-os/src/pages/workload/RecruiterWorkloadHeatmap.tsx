import React, { useMemo, useState } from 'react';

type ReqComplexity = 'low' | 'medium' | 'high' | 'specialized';

type WorkloadRecord = {
  id: string;
  recruiter: string;
  department: string;
  complexity: ReqComplexity;
  activeReqs: number;
  candidatesInProcess: number;
  workloadDensityScore: number; // 0-100
  burnoutRiskBaseline: number; // 0-100
  slaDegradationBaseline: number; // 0-100
  continuityFailureBaseline: number; // 0-100
  partial?: boolean;
};

type RedistributionAction = {
  id: string;
  label: string;
  densityReduction: number;
  burnoutRiskReduction: number;
  slaLift: number;
  continuityLift: number;
  confidence: number;
  effort: number;
  rationale: string[];
};

type Scenario = {
  name: string;
  sensitivity: number;
  confidenceFloor: number;
  effortBudget: number;
};

type Props = {
  data?: WorkloadRecord[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const complexityLabel: Record<ReqComplexity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  specialized: 'Specialized',
};

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

const workloadRisk = (r: WorkloadRecord, sensitivity: number) => {
  const reqPressure = Math.min(100, r.activeReqs * 5);
  const pipelinePressure = Math.min(100, r.candidatesInProcess * 0.8);
  const base = r.workloadDensityScore * 0.36 + r.burnoutRiskBaseline * 0.24 + reqPressure * 0.2 + pipelinePressure * 0.2;
  return Math.round(clamp(base + sensitivity));
};

const actions: RedistributionAction[] = [
  {
    id: 'stage-partitioning-shift',
    label: 'Stage-partitioning workload shift',
    densityReduction: 18,
    burnoutRiskReduction: 15,
    slaLift: 9,
    continuityLift: 6,
    confidence: 85,
    effort: 3,
    rationale: ['Splits requisition ownership by funnel stage', 'Significantly reduces context-switching fatigue'],
  },
  {
    id: 'cross-department-load-balance',
    label: 'Cross-department load balance',
    densityReduction: 14,
    burnoutRiskReduction: 12,
    slaLift: 7,
    continuityLift: 5,
    confidence: 82,
    effort: 2,
    rationale: ['Reassigns requisitions to under-capacity recruiters in adjacent orgs', 'Protects SLA adherence during localized hiring surges'],
  },
  {
    id: 'low-complexity-req-shedding',
    label: 'Low-complexity req shedding',
    densityReduction: 12,
    burnoutRiskReduction: 10,
    slaLift: 8,
    continuityLift: 4,
    confidence: 78,
    effort: 2,
    rationale: ['Reassigns low-tier reqs to junior capacity', 'Frees focus for high-complexity pipelines'],
  },
  {
    id: 'candidate-throttle-cap',
    label: 'Candidate throttle cap',
    densityReduction: 8,
    burnoutRiskReduction: 7,
    slaLift: 4,
    continuityLift: 3,
    confidence: 75,
    effort: 1,
    rationale: ['Pauses new sourcing on overwhelmed requisitions', 'Stabilizes continuity for active pipeline candidates'],
  },
];

const rankActions = (r: WorkloadRecord, s: Scenario) => {
  const risk = workloadRisk(r, s.sensitivity);
  const options = actions
    .filter((a) => a.confidence >= s.confidenceFloor)
    .map((a) => {
      const urgency = 0.82 + risk / 145;
      const projectedDensity = clamp(r.workloadDensityScore - a.densityReduction * urgency);
      const projectedBurnout = clamp(r.burnoutRiskBaseline - a.burnoutRiskReduction * urgency);
      const projectedSla = clamp((100 - r.slaDegradationBaseline) + a.slaLift * urgency);
      const projectedContinuity = clamp((100 - r.continuityFailureBaseline) + a.continuityLift * urgency);
      
      const score = Math.round(
        (100 - projectedDensity) * 0.25 + 
        (100 - projectedBurnout) * 0.25 + 
        projectedSla * 0.25 + 
        projectedContinuity * 0.15 + 
        a.confidence * 0.1 - 
        a.effort * 8
      );
      
      return { ...a, projectedDensity, projectedBurnout, projectedSla, projectedContinuity, score };
    })
    .sort((a, b) => b.score - a.score);

  const queue: typeof options = [];
  let used = 0;
  for (const o of options) {
    if (used + o.effort <= s.effortBudget) {
      queue.push(o);
      used += o.effort;
    }
  }

  return {
    queue,
    used,
    avgDensity: Number((queue.length ? queue.reduce((sum, q) => sum + q.projectedDensity, 0) / queue.length : r.workloadDensityScore).toFixed(1)),
    avgBurnout: Number((queue.length ? queue.reduce((sum, q) => sum + q.projectedBurnout, 0) / queue.length : r.burnoutRiskBaseline).toFixed(1)),
    avgSla: Number((queue.length ? queue.reduce((sum, q) => sum + q.projectedSla, 0) / queue.length : 100 - r.slaDegradationBaseline).toFixed(1)),
    avgContinuity: Number((queue.length ? queue.reduce((sum, q) => sum + q.projectedContinuity, 0) / queue.length : 100 - r.continuityFailureBaseline).toFixed(1)),
  };
};

const getHeatmapColor = (density: number) => {
  if (density > 85) return '#991b1b'; // Red
  if (density > 70) return '#ea580c'; // Orange
  if (density > 50) return '#ca8a04'; // Yellow
  return '#16a34a'; // Green
};

export const RecruiterWorkloadHeatmap: React.FC<Props> = ({ data = [], loading = false, error = null, onRetry }) => {
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [complexityFilter, setComplexityFilter] = useState<'all' | ReqComplexity>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [scenarioA, setScenarioA] = useState<Scenario>({ name: 'Conservative Shedding', sensitivity: 0, confidenceFloor: 78, effortBudget: 3 });
  const [scenarioB, setScenarioB] = useState<Scenario>({ name: 'Aggressive Rebalance', sensitivity: 10, confidenceFloor: 72, effortBudget: 5 });
  
  const [expanded, setExpanded] = useState<string | null>(null);

  const departments = useMemo(() => ['all', ...Array.from(new Set(data.map((d) => d.department))).sort()], [data]);

  const rows = useMemo(() => {
    return data
      .filter((d) => (departmentFilter === 'all' ? true : d.department === departmentFilter))
      .filter((d) => (complexityFilter === 'all' ? true : d.complexity === complexityFilter))
      .map((d) => ({
        ...d,
        riskA: workloadRisk(d, scenarioA.sensitivity),
        riskB: workloadRisk(d, scenarioB.sensitivity),
      }))
      .sort((a, b) => b.workloadDensityScore - a.workloadDensityScore);
  }, [data, departmentFilter, complexityFilter, scenarioA.sensitivity, scenarioB.sensitivity]);

  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? rows[0] ?? null, [rows, selectedId]);
  
  const rankedA = useMemo(() => (selected ? rankActions(selected, scenarioA) : null), [selected, scenarioA]);
  const rankedB = useMemo(() => (selected ? rankActions(selected, scenarioB) : null), [selected, scenarioB]);

  if (loading) return <section aria-busy='true' style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Recruiter Workload Heatmap</h3><p style={{ color: '#6b7280' }}>Loading workload telemetry…</p></section>;
  if (error) return <section role='alert' style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 12, padding: 16 }}><h3 style={{ margin: 0, color: '#991b1b' }}>Workload heatmap unavailable</h3><p style={{ color: '#7f1d1d' }}>{error}</p><button type='button' onClick={onRetry}>Retry</button></section>;
  if (!data.length) return <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Recruiter Workload Heatmap</h3><p style={{ color: '#6b7280' }}>No workload records available.</p></section>;

  const renderScenarioCard = (key: 'A'|'B', scenario: Scenario, ranked: NonNullable<typeof rankedA>) => (
    <section style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: 16, background: '#f9fafb' }}>
      <h4 style={{ margin: '0 0 12px 0' }}>{scenario.name}</h4>
      
      <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
          Sensitivity (+{scenario.sensitivity})
          <input type='range' min={-20} max={20} value={scenario.sensitivity} onChange={(e) => {
            const v = Number(e.target.value);
            key === 'A' ? setScenarioA(s => ({ ...s, sensitivity: v })) : setScenarioB(s => ({ ...s, sensitivity: v }));
          }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
          Confidence Floor ({scenario.confidenceFloor}%)
          <input type='range' min={60} max={95} value={scenario.confidenceFloor} onChange={(e) => {
            const v = Number(e.target.value);
            key === 'A' ? setScenarioA(s => ({ ...s, confidenceFloor: v })) : setScenarioB(s => ({ ...s, confidenceFloor: v }));
          }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
          Effort Budget ({scenario.effortBudget})
          <input type='range' min={1} max={10} value={scenario.effortBudget} onChange={(e) => {
            const v = Number(e.target.value);
            key === 'A' ? setScenarioA(s => ({ ...s, effortBudget: v })) : setScenarioB(s => ({ ...s, effortBudget: v }));
          }} />
        </label>
      </div>

      <div style={{ fontSize: 13, marginBottom: 12, color: '#374151', display: 'flex', justifyContent: 'space-between' }}>
        <span>Density: <strong>{ranked.avgDensity}</strong></span>
        <span>Burnout: <strong>{ranked.avgBurnout}%</strong></span>
        <span>SLA: <strong>{ranked.avgSla}%</strong></span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ranked.queue.length === 0 ? <p style={{ fontSize: 13, color: '#6b7280' }}>No actions match constraints.</p> : ranked.queue.map(action => (
           <div key={`${key}-${action.id}`} style={{ padding: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6 }}>
             <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{action.label}</div>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', fontSize: 12, color: '#4b5563', marginBottom: 8 }}>
               <span>Density: <strong>{action.projectedDensity.toFixed(0)}</strong></span>
               <span>Burnout: <strong>{action.projectedBurnout.toFixed(0)}%</strong></span>
               <span>SLA: <strong>{action.projectedSla.toFixed(0)}%</strong></span>
             </div>
             <button 
                onClick={() => setExpanded(expanded === `${key}-${action.id}` ? null : `${key}-${action.id}`)}
                style={{ background: 'none', border: 'none', color: '#2563eb', padding: 0, cursor: 'pointer', fontSize: 12 }}
             >
               {expanded === `${key}-${action.id}` ? 'Hide Rationale' : 'View Rationale'}
             </button>
             {expanded === `${key}-${action.id}` && (
               <ul style={{ margin: '8px 0 0 0', paddingLeft: 16, fontSize: 12, color: '#374151' }}>
                 {action.rationale.map((r, i) => <li key={i}>{r}</li>)}
               </ul>
             )}
           </div>
        ))}
      </div>
    </section>
  );

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Recruiter Workload Heatmap</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#6b7280' }}>Predict burnout and optimize load-redistribution sequences.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select 
            value={departmentFilter} 
            onChange={e => setDepartmentFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
          >
            {departments.map(d => <option key={d} value={d}>{d === 'all' ? 'All Depts' : d}</option>)}
          </select>
          <select 
            value={complexityFilter} 
            onChange={e => setComplexityFilter(e.target.value as 'all' | ReqComplexity)}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
          >
            <option value="all">All Complexities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="specialized">Specialized</option>
          </select>
        </div>
      </header>

      <div style={{ overflowX: 'auto', marginBottom: 24, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
          <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Recruiter</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Dept / Complexity</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Active Reqs</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Candidates</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Density Score</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Burnout Risk</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr 
                key={row.id} 
                onClick={() => setSelectedId(row.id)}
                style={{ 
                  cursor: 'pointer', 
                  borderBottom: '1px solid #e5e7eb',
                  background: selectedId === row.id ? '#eff6ff' : '#fff',
                  transition: 'background 0.15s'
                }}
              >
                <td style={{ padding: '12px 16px' }}>{row.recruiter}</td>
                <td style={{ padding: '12px 16px' }}>{row.department} · {complexityLabel[row.complexity]}</td>
                <td style={{ padding: '12px 16px' }}>{row.activeReqs}</td>
                <td style={{ padding: '12px 16px' }}>{row.candidatesInProcess}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: getHeatmapColor(row.workloadDensityScore) }} />
                    {row.workloadDensityScore}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>{row.burnoutRiskBaseline}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && rankedA && rankedB && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {renderScenarioCard('A', scenarioA, rankedA)}
          {renderScenarioCard('B', scenarioB, rankedB)}
        </div>
      )}
    </div>
  );
};

