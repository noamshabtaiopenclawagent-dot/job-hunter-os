import React, { useMemo, useState } from 'react';

type MatchRecord = {
  id: string;
  candidate: string;
  role: string;
  skillsFit: number;
  domainFit: number;
  seniorityFit: number;
  locationFit: number;
  historicalOutcome: 'advanced' | 'rejected' | 'offer';
  partial?: boolean;
};

type Props = {
  data?: MatchRecord[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export const CvJdExplainableMatchCalibrationThresholdTuning: React.FC<Props> = ({ data = [], loading = false, error = null, onRetry }) => {
  const [weights, setWeights] = useState({ skills: 40, domain: 25, seniority: 20, location: 15 });
  const [threshold, setThreshold] = useState(72);

  const scored = useMemo(() => {
    return data.map((r) => {
      const score = clamp(
        (r.skillsFit * weights.skills + r.domainFit * weights.domain + r.seniorityFit * weights.seniority + r.locationFit * weights.location) / 100,
      );
      const decision = score >= threshold ? 'pass' : 'hold';
      const correct = (decision === 'pass' && (r.historicalOutcome === 'advanced' || r.historicalOutcome === 'offer')) || (decision === 'hold' && r.historicalOutcome === 'rejected');
      return { ...r, score: Math.round(score), decision, correct };
    });
  }, [data, weights, threshold]);

  const kpi = useMemo(() => {
    if (!scored.length) return { precision: 0, passRate: 0, calibration: 0 };
    const pass = scored.filter((s) => s.decision === 'pass');
    const precision = pass.length ? Math.round((pass.filter((s) => s.historicalOutcome !== 'rejected').length / pass.length) * 100) : 0;
    const passRate = Math.round((pass.length / scored.length) * 100);
    const calibration = Math.round((scored.filter((s) => s.correct).length / scored.length) * 100);
    return { precision, passRate, calibration };
  }, [scored]);

  if (loading) return <section aria-busy='true' style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>CV-JD Calibration</h3><p style={{ color: '#6b7280' }}>Loading scoring telemetry…</p></section>;
  if (error) return <section role='alert' style={{ border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 12, padding: 16 }}><h3 style={{ margin: 0, color: '#991b1b' }}>Calibration unavailable</h3><p style={{ color: '#7f1d1d' }}>{error}</p><button onClick={onRetry}>Retry</button></section>;
  if (!data.length) return <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}><h3 style={{ margin: 0 }}>CV-JD Calibration</h3><p style={{ color: '#6b7280' }}>No match records available.</p></section>;

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', padding: 20 }}>
      <header style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>CV-JD Explainable Match Calibration</h2>
        <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#6b7280' }}>Tune weighted score thresholds and validate calibration against historical outcomes.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={{ fontSize: 12 }}>Skills ({weights.skills})<input type='range' min={20} max={60} value={weights.skills} onChange={(e) => setWeights((w) => ({ ...w, skills: Number(e.target.value) }))} /></label>
            <label style={{ fontSize: 12 }}>Domain ({weights.domain})<input type='range' min={10} max={40} value={weights.domain} onChange={(e) => setWeights((w) => ({ ...w, domain: Number(e.target.value) }))} /></label>
            <label style={{ fontSize: 12 }}>Seniority ({weights.seniority})<input type='range' min={5} max={35} value={weights.seniority} onChange={(e) => setWeights((w) => ({ ...w, seniority: Number(e.target.value) }))} /></label>
            <label style={{ fontSize: 12 }}>Location ({weights.location})<input type='range' min={5} max={30} value={weights.location} onChange={(e) => setWeights((w) => ({ ...w, location: Number(e.target.value) }))} /></label>
            <label style={{ fontSize: 12 }}>Decision threshold ({threshold})<input type='range' min={50} max={90} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} /></label>
          </div>

          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ background: '#dcfce7', color: '#166534', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>Precision {kpi.precision}%</span>
            <span style={{ background: '#dbeafe', color: '#1e3a8a', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>Pass rate {kpi.passRate}%</span>
            <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>Calibration {kpi.calibration}%</span>
          </div>
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead style={{ background: '#f9fafb' }}><tr><th style={{ textAlign: 'left', padding: 8 }}>Candidate</th><th style={{ textAlign: 'left', padding: 8 }}>Score</th><th style={{ textAlign: 'left', padding: 8 }}>Decision</th></tr></thead>
            <tbody>
              {scored.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid #e5e7eb', background: r.correct ? '#f0fdf4' : '#fff7ed' }}>
                  <td style={{ padding: 8 }}>{r.candidate}<div style={{ color: '#6b7280' }}>{r.role}</div></td>
                  <td style={{ padding: 8 }}>{r.score}</td>
                  <td style={{ padding: 8 }}>{r.decision}{r.partial ? ' · partial' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
