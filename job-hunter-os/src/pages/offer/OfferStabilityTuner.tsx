import React, { useState, useMemo } from 'react';

type CandidateOfferContext = {
  id: string;
  name: string;
  role: string;
  department: string;
  compExpectationMin: number;
  compExpectationMax: number;
  compPushed: boolean;
  marketRatePercentile: number;
  competingOffers: number;
  timeInProcessDays: number;
  interviewScoreAvg: number; // 1-10
  flightRiskFlags: string[];
};

type ScenarioConfig = {
  baseCompOffset: number; // percentage adjustment
  signOnBonus: number; // raw amount
  equityGrantAdjust: number; // percentage of standard
  negotiationRoundTolerance: number;
};

type Props = {
  data?: CandidateOfferContext[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

const calculateProjectedAcceptance = (candidate: CandidateOfferContext, config: ScenarioConfig) => {
  let score = 50; // base probability

  // Target midpoint of expectations
  const expectationMid = (candidate.compExpectationMin + candidate.compExpectationMax) / 2;
  const standardOffer = expectationMid * (candidate.marketRatePercentile / 100);
  const proposedBase = standardOffer * (1 + config.baseCompOffset / 100);
  
  // Comp factor
  if (proposedBase >= candidate.compExpectationMax) score += 30;
  else if (proposedBase >= expectationMid) score += 15;
  else if (proposedBase < candidate.compExpectationMin) score -= 35;
  
  // Sign-on bonus factor
  if (config.signOnBonus > 0) {
    if (config.signOnBonus >= 20000) score += 15;
    else if (config.signOnBonus >= 10000) score += 8;
    else score += 4;
  }

  // Equity factor
  if (config.equityGrantAdjust > 0) score += (config.equityGrantAdjust / 10);
  else if (config.equityGrantAdjust < 0) score -= (Math.abs(config.equityGrantAdjust) / 5);

  // Competing offers factor (highly detrimental unless comp is extremely strong)
  if (candidate.competingOffers > 0) {
    score -= (candidate.competingOffers * 12);
    if (proposedBase >= candidate.compExpectationMax) score += (candidate.competingOffers * 8); // mitigate if offer is maxed
  }

  // Process fatigue
  if (candidate.timeInProcessDays > 45) score -= 15;
  else if (candidate.timeInProcessDays > 30) score -= 5;
  else if (candidate.timeInProcessDays < 15) score += 10;

  // Flight risk flags
  score -= (candidate.flightRiskFlags.length * 8);

  return {
    probability: Math.max(5, Math.min(95, Math.round(score))),
    proposedBase: Math.round(proposedBase)
  };
};

export const OfferStabilityTuner: React.FC<Props> = ({ data = [], loading = false, error = null, onRetry }) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  
  const [scenarioA, setScenarioA] = useState<ScenarioConfig>({
    baseCompOffset: 0,
    signOnBonus: 0,
    equityGrantAdjust: 0,
    negotiationRoundTolerance: 1
  });

  const [scenarioB, setScenarioB] = useState<ScenarioConfig>({
    baseCompOffset: 5,
    signOnBonus: 10000,
    equityGrantAdjust: 20,
    negotiationRoundTolerance: 2
  });

  const selectedCandidate = useMemo(() => 
    data.find(c => c.id === selectedCandidateId) || data[0] || null
  , [data, selectedCandidateId]);

  if (loading) return <section aria-busy='true' style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Offer Stability Tuner</h3><p style={{ color: '#6b7280' }}>Loading candidate data…</p></section>;
  if (error) return <section role='alert' style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 12, padding: 16 }}><h3 style={{ margin: 0, color: '#991b1b' }}>Tuner unavailable</h3><p style={{ color: '#7f1d1d' }}>{error}</p><button type='button' onClick={onRetry}>Retry</button></section>;
  if (!data.length) return <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>Offer Stability Tuner</h3><p style={{ color: '#6b7280' }}>No active offers pending.</p></section>;

  const renderCandidateList = () => (
    <div style={{ flex: '0 0 300px', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
      <h4 style={{ margin: 0, padding: 16, borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>Pending Offers</h4>
      <div style={{ overflowY: 'auto', flexGrow: 1 }}>
        {data.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCandidateId(c.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: 16,
              border: 'none',
              borderBottom: '1px solid #f3f4f6',
              background: selectedCandidate?.id === c.id ? '#eff6ff' : '#fff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <span style={{ fontWeight: 600, color: '#111827' }}>{c.name}</span>
            <span style={{ fontSize: 12, color: '#4b5563' }}>{c.role}</span>
            {c.competingOffers > 0 && <span style={{ fontSize: 11, color: '#b91c1c', marginTop: 4 }}>{c.competingOffers} competing offers</span>}
          </button>
        ))}
      </div>
    </div>
  );

  const renderScenarioControls = (label: string, config: ScenarioConfig, setConfig: React.Dispatch<React.SetStateAction<ScenarioConfig>>, candidate: CandidateOfferContext) => {
    const proj = calculateProjectedAcceptance(candidate, config);
    return (
      <div style={{ flex: 1, padding: 20, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: 16 }}>{label}</h4>
        
        <div style={{ marginBottom: 24, padding: 16, background: '#fff', borderRadius: 8, border: '1px solid #d1d5db', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Projected Base</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>{formatCurrency(proj.proposedBase)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Acceptance Prob</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: proj.probability > 70 ? '#16a34a' : proj.probability > 40 ? '#ca8a04' : '#dc2626' }}>
              {proj.probability}%
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 500 }}>
            Base Salary Offset: {config.baseCompOffset > 0 ? '+' : ''}{config.baseCompOffset}%
            <input type="range" min="-10" max="25" step="1" value={config.baseCompOffset} onChange={e => setConfig({ ...config, baseCompOffset: Number(e.target.value) })} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 500 }}>
            Sign-on Bonus: {formatCurrency(config.signOnBonus)}
            <input type="range" min="0" max="50000" step="5000" value={config.signOnBonus} onChange={e => setConfig({ ...config, signOnBonus: Number(e.target.value) })} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 500 }}>
            Equity Adjustment: {config.equityGrantAdjust > 0 ? '+' : ''}{config.equityGrantAdjust}%
            <input type="range" min="-50" max="100" step="5" value={config.equityGrantAdjust} onChange={e => setConfig({ ...config, equityGrantAdjust: Number(e.target.value) })} />
          </label>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', display: 'flex', height: 600, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {renderCandidateList()}
      
      {selectedCandidate && (
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <header style={{ padding: 24, borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ margin: 0, fontSize: 20, color: '#111827' }}>Offer Stability Simulation: {selectedCandidate.name}</h2>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 13, color: '#4b5563' }}>
              <span>Target Range: <strong>{formatCurrency(selectedCandidate.compExpectationMin)} - {formatCurrency(selectedCandidate.compExpectationMax)}</strong></span>
              <span>Time in process: <strong>{selectedCandidate.timeInProcessDays} days</strong></span>
              <span>Interview Score: <strong>{selectedCandidate.interviewScoreAvg}/10</strong></span>
            </div>
            {selectedCandidate.flightRiskFlags.length > 0 && (
              <div style={{ marginTop: 12, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, color: '#991b1b', fontSize: 13 }}>
                <strong>Risk Flags:</strong> {selectedCandidate.flightRiskFlags.join(', ')}
              </div>
            )}
          </header>
          
          <div style={{ padding: 24, display: 'flex', gap: 24 }}>
            {renderScenarioControls('Scenario A: Standard Package', scenarioA, setScenarioA, selectedCandidate)}
            {renderScenarioControls('Scenario B: Aggressive Closing', scenarioB, setScenarioB, selectedCandidate)}
          </div>
        </div>
      )}
    </div>
  );
};
