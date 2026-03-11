import React, { useMemo, useState } from 'react';

type DriftCriteria = 'skills' | 'domain' | 'seniority' | 'location';
type DriftData = {
  id: string;
  candidate: string;
  role: string;
  overallDrift: number;
  criteria: Record<DriftCriteria, { delta: number; rationale: string }>;
};

type Props = {
  loading?: boolean;
  error?: string | null;
  data?: DriftData[];
};

export const CandidateMatchDriftIndicatorCards: React.FC<Props> = ({
  loading = false,
  error = null,
  data = [
    {
      id: 'c1',
      candidate: 'Noa Levi',
      role: 'Frontend Engineer',
      overallDrift: -12,
      criteria: {
        skills: { delta: -5, rationale: 'Missing React 18 hooks depth' },
        domain: { delta: -2, rationale: 'SaaS experience gap' },
        seniority: { delta: -5, rationale: 'Only 3 years exp vs 5 req' },
        location: { delta: 0, rationale: 'Matches hybrid req' },
      },
    },
    {
      id: 'c2',
      candidate: 'Idan Bar',
      role: 'Backend Engineer',
      overallDrift: 4,
      criteria: {
        skills: { delta: 2, rationale: 'Strong Go background' },
        domain: { delta: 2, rationale: 'Previous fintech matches' },
        seniority: { delta: 0, rationale: 'Meets 4 years exp' },
        location: { delta: 0, rationale: 'Fully remote matches' },
      },
    },
  ],
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'driftAsc' | 'driftDesc'>('driftAsc');

  const parseSortBy = (value: string): 'driftAsc' | 'driftDesc' => (value === 'driftDesc' ? 'driftDesc' : 'driftAsc');

  const filteredAndSorted = useMemo(() => {
    let result = data;
    if (roleFilter !== 'all') {
      result = result.filter((d) => d.role === roleFilter);
    }
    result = [...result].sort((a, b) => {
      if (sortBy === 'driftAsc') return a.overallDrift - b.overallDrift;
      return b.overallDrift - a.overallDrift;
    });
    return result;
  }, [data, roleFilter, sortBy]);

  const roles = useMemo(() => Array.from(new Set(data.map((d) => d.role))), [data]);

  if (loading) return <p>Loading drift data...</p>;
  if (error) return <p style={{ color: '#991b1b' }}>{error}</p>;
  if (!data.length) return <p>No candidates found.</p>;

  return (
    <section>
      <h3>Candidate Match Drift Indicator Cards</h3>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <label>
          Role Filter
          <select aria-label="Role Filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">All</option>
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>
        <label>
          Sort By
          <select aria-label="Sort By" value={sortBy} onChange={(e) => setSortBy(parseSortBy(e.target.value))}>
            <option value="driftAsc">Drift (Ascending)</option>
            <option value="driftDesc">Drift (Descending)</option>
          </select>
        </label>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {filteredAndSorted.map((c) => (
          <article key={c.id} style={{ border: '1px solid #e5e7eb', padding: 12, borderRadius: 8 }}>
            <h4 style={{ marginTop: 0, marginBottom: 4 }}>{c.candidate} — {c.role}</h4>
            <div style={{ marginBottom: 8 }}>Overall Drift: <strong>{c.overallDrift}</strong></div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(Object.keys(c.criteria) as DriftCriteria[]).map((crit) => (
                <span
                  key={crit}
                  aria-label={`${crit} delta ${c.criteria[crit].delta}`}
                  title={c.criteria[crit].rationale}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 999,
                    background: c.criteria[crit].delta < 0 ? '#fee2e2' : c.criteria[crit].delta > 0 ? '#dcfce3' : '#f3f4f6',
                    fontSize: 12,
                    cursor: 'help'
                  }}
                >
                  {crit}: {c.criteria[crit].delta > 0 ? '+' : ''}{c.criteria[crit].delta}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
