import React, { useMemo, useState } from 'react';

type Channel = 'linkedin' | 'referral' | 'outbound' | 'organic_web' | 'agency';

type SourcingRecord = {
  id: string;
  role: string;
  channel: Channel;
  velocityPerWeek: number;
  costPerHire: number;
  qualityBaseline: number; // 0-100
  pipelineConversionRate: number; // 0-100
  timeToFillBaseline: number;
  budgetAllocation: number;
  partial?: boolean;
};

type ShiftAction = {
  id: string;
  label: string;
  velocityLift: number;
  qualityLift: number;
  conversionLift: number;
  costDelta: number;
  confidence: number;
  effort: number;
  rationale: string[];
};

type Scenario = {
  name: string;
  sensitivity: number;
  confidenceFloor: number;
  budgetFlex: number; // percent shift
};

type Props = {
  data?: SourcingRecord[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const channelLabel: Record<Channel, string> = {
  linkedin: 'LinkedIn',
  referral: 'Referral',
  outbound: 'Outbound',
  organic_web: 'Organic Web',
  agency: 'Agency',
};

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

const actions: ShiftAction[] = [
  {
    id: 'scale-referral-incentive',
    label: 'Scale referral incentive',
    velocityLift: 15,
    qualityLift: 10,
    conversionLift: 12,
    costDelta: -500,
    confidence: 85,
    effort: 2,
    rationale: ['Highest ROI quality channel', 'Lowers overall CPH while boosting pipeline conversion'],
  },
  {
    id: 'outbound-automation-boost',
    label: 'Outbound automation boost',
    velocityLift: 25,
    qualityLift: 5,
    conversionLift: 2,
    costDelta: 200,
    confidence: 80,
    effort: 3,
    rationale: ['Significantly increases top-of-funnel velocity', 'Requires tight targeting to protect quality'],
  },
  {
    id: 'linkedin-paid-optimization',
    label: 'LinkedIn paid optimization',
    velocityLift: 10,
    qualityLift: 8,
    conversionLift: 5,
    costDelta: 800,
    confidence: 78,
    effort: 2,
    rationale: ['Targets passive high-quality candidates', 'Predictable volume but high marginal cost'],
  },
  {
    id: 'agency-throttle-down',
    label: 'Agency throttle down',
    velocityLift: -10,
    qualityLift: -2,
    conversionLift: -2,
    costDelta: -4000,
    confidence: 90,
    effort: 1,
    rationale: ['Reallocates high agency spend to internal channels', 'Slight velocity drop offset by massive cost savings'],
  },
];

const simulateShift = (r: SourcingRecord, s: Scenario) => {
  const options = actions
    .filter((a) => a.confidence >= s.confidenceFloor)
    .map((a) => {
      const flexMultiplier = 1 + (s.budgetFlex / 100);
      const projectedVelocity = Math.max(0, r.velocityPerWeek + a.velocityLift * flexMultiplier);
      const projectedQuality = clamp(r.qualityBaseline + a.qualityLift * flexMultiplier + s.sensitivity * 0.5);
      const projectedConversion = clamp(r.pipelineConversionRate + a.conversionLift * flexMultiplier);
      const projectedCost = Math.max(0, r.costPerHire + a.costDelta);
      
      // Basic scoring heuristic
      const score = Math.round(
        (projectedVelocity * 2) + 
        projectedQuality * 0.4 + 
        projectedConversion * 0.4 - 
        (projectedCost / 1000) * 5 + 
        a.confidence * 0.1 - 
        a.effort * 5
      );

      return { ...a, projectedVelocity, projectedQuality, projectedConversion, projectedCost, score };
    })
    .sort((a, b) => b.score - a.score);

  return options.slice(0, 3); // Top 3 strategies
};

export const CandidateSourcingVelocityRadar: React.FC<Props> = ({ data = [], loading = false, error = null, onRetry }) => {
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [scenarioA, setScenarioA] = useState<Scenario>({ name: 'Conservative Shift', sensitivity: 0, confidenceFloor: 80, budgetFlex: 10 });
  const [scenarioB, setScenarioB] = useState<Scenario>({ name: 'Aggressive Growth', sensitivity: 10, confidenceFloor: 75, budgetFlex: 30 });
  
  const [expanded, setExpanded] = useState<string | null>(null);

  const roles = useMemo(() => ['all', ...Array.from(new Set(data.map((d) => d.role))).sort()], [data]);

  const rows = useMemo(() => {
    return data.filter((d) => (roleFilter === 'all' ? true : d.role === roleFilter));
  }, [data, roleFilter]);

  const selected = useMemo(() => rows.find((r) => r.id === selectedId) ?? rows[0] ?? null, [rows, selectedId]);
  
  const simA = useMemo(() => (selected ? simulateShift(selected, scenarioA) : []), [selected, scenarioA]);
  const simB = useMemo(() => (selected ? simulateShift(selected, scenarioB) : []), [selected, scenarioB]);

  if (loading) return <section aria-busy='true' style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Candidate sourcing velocity radar</h3><p style={{ color: '#6b7280' }}>Loading sourcing telemetry…</p></section>;
  if (error) return <section role='alert' style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 12, padding: 16 }}><h3 style={{ margin: 0, color: '#991b1b' }}>Sourcing radar unavailable</h3><p style={{ color: '#7f1d1d' }}>{error}</p><button type='button' onClick={onRetry}>Retry</button></section>;
  if (!data.length) return <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Candidate sourcing velocity radar</h3><p style={{ color: '#6b7280' }}>No sourcing records available.</p></section>;

  const renderScenarioCard = (key: 'A'|'B', scenario: Scenario, sim: ReturnType<typeof simulateShift>, setScenario: React.Dispatch<React.SetStateAction<Scenario>>) => (
    <section style={{ border: '1px solid #f3f4f6', borderRadius: 10, padding: 16, background: '#f9fafb' }}>
      <h4 style={{ margin: '0 0 12px 0' }}>{scenario.name}</h4>
      
      <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
          Sensitivity (+{scenario.sensitivity})
          <input type='range' min={-20} max={20} value={scenario.sensitivity} onChange={(e) => setScenario(s => ({ ...s, sensitivity: Number(e.target.value) }))} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
          Budget Flex ({scenario.budgetFlex}%)
          <input type='range' min={0} max={50} value={scenario.budgetFlex} onChange={(e) => setScenario(s => ({ ...s, budgetFlex: Number(e.target.value) }))} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
          Confidence Floor ({scenario.confidenceFloor}%)
          <input type='range' min={60} max={95} value={scenario.confidenceFloor} onChange={(e) => setScenario(s => ({ ...s, confidenceFloor: Number(e.target.value) }))} />
        </label>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sim.length === 0 ? <p style={{ fontSize: 13, color: '#6b7280' }}>No strategies match constraints.</p> : sim.map(action => (
           <div key={`${key}-${action.id}`} style={{ padding: 12, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 6 }}>
             <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{action.label}</div>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', fontSize: 12, color: '#4b5563', marginBottom: 8 }}>
               <span>Vel: <strong>{action.projectedVelocity.toFixed(1)}/wk</strong></span>
               <span>Qual: <strong>{action.projectedQuality.toFixed(0)}</strong></span>
               <span>Conv: <strong>{action.projectedConversion.toFixed(1)}%</strong></span>
               <span>Cost: <strong>${action.projectedCost.toFixed(0)}</strong></span>
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
          <h2 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Candidate Sourcing Velocity Radar</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#6b7280' }}>Simulate channel-attribution shifts and project pipeline outcomes.</p>
        </div>
        <div>
          <select 
            value={roleFilter} 
            onChange={e => setRoleFilter(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 14 }}
          >
            {roles.map(r => <option key={r} value={r}>{r === 'all' ? 'All Roles' : r}</option>)}
          </select>
        </div>
      </header>

      <div style={{ overflowX: 'auto', marginBottom: 24, border: '1px solid #e5e7eb', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
          <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Role</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Channel</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Velocity / wk</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Quality</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Conversion</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>Cost / Hire</th>
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
                <td style={{ padding: '12px 16px' }}>{row.role}</td>
                <td style={{ padding: '12px 16px' }}>{channelLabel[row.channel]}</td>
                <td style={{ padding: '12px 16px' }}>{row.velocityPerWeek}</td>
                <td style={{ padding: '12px 16px' }}>{row.qualityBaseline}</td>
                <td style={{ padding: '12px 16px' }}>{row.pipelineConversionRate}%</td>
                <td style={{ padding: '12px 16px' }}>${row.costPerHire}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {renderScenarioCard('A', scenarioA, simA, setScenarioA)}
          {renderScenarioCard('B', scenarioB, simB, setScenarioB)}
        </div>
      )}
    </div>
  );
};
