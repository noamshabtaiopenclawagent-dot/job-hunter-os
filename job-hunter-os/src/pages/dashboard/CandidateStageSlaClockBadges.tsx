import React, { useEffect, useMemo, useState } from 'react';

type Role = 'recruiter' | 'coordinator' | 'manager';

type SlaItem = {
  id: string;
  candidate: string;
  role: Role;
  stage: string;
  minutesRemaining: number;
};

type Props = {
  data?: SlaItem[];
  rowHeight?: number;
  viewportHeight?: number;
  overscan?: number;
};

const colorForMinutes = (m: number) => {
  if (m < 0) return '#991b1b';
  if (m <= 30) return '#b45309';
  return '#1d4ed8';
};

export const CandidateStageSlaClockBadges: React.FC<Props> = ({
  data = [
    { id: '1', candidate: 'Noa Levi', role: 'recruiter', stage: 'interview', minutesRemaining: 22 },
    { id: '2', candidate: 'Omri Tal', role: 'coordinator', stage: 'offer', minutesRemaining: -15 },
    { id: '3', candidate: 'Maya Cohen', role: 'manager', stage: 'screen', minutesRemaining: 95 },
  ],
  rowHeight = 44,
  viewportHeight = 132,
  overscan = 2,
}) => {
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [tick, setTick] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const i = window.setInterval(() => setTick((t) => t + 1), 60000);
    return () => window.clearInterval(i);
  }, []);

  const filtered = useMemo(
    () => data.filter((d) => roleFilter === 'all' || d.role === roleFilter),
    [data, roleFilter],
  );

  const start = Math.max(0, Math.floor(scrollTop / rowHeight));
  const visibleCount = Math.ceil(viewportHeight / rowHeight);
  const end = Math.min(filtered.length, start + visibleCount + overscan);
  const windowed = filtered.slice(start, end);

  return (
    <section>
      <h3>Candidate Stage SLA Clock Badges</h3>
      <label>
        Role filter
        <select aria-label="Role filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as Role | 'all')}>
          <option value="all">All</option>
          <option value="recruiter">Recruiter</option>
          <option value="coordinator">Coordinator</option>
          <option value="manager">Manager</option>
        </select>
      </label>

      <div
        data-testid="virtualized-list"
        onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
        style={{ height: viewportHeight, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, marginTop: 12 }}
      >
        <div style={{ height: filtered.length * rowHeight, position: 'relative' }}>
          {windowed.map((item, idx) => {
            const top = (start + idx) * rowHeight;
            const remaining = item.minutesRemaining - tick;
            const overdue = remaining < 0 ? Math.abs(remaining) : 0;
            return (
              <div
                key={item.id}
                title={overdue ? `Overdue by ${overdue} minute(s)` : `Remaining ${remaining} minute(s)`}
                style={{
                  position: 'absolute',
                  top,
                  left: 0,
                  right: 0,
                  height: rowHeight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 10px',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <span>{item.candidate} • {item.stage}</span>
                <span style={{ background: colorForMinutes(remaining), color: '#fff', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>
                  {remaining}m
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <small data-testid="virtual-window-meta">start:{start} end:{end} overscan:{overscan} rowHeight:{rowHeight}</small>
    </section>
  );
};
