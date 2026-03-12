import React, { useMemo } from 'react';

type Stage =
  | 'sourced'
  | 'applied'
  | 'screen'
  | 'manager_interview'
  | 'onsite'
  | 'offer'
  | 'closed';

type TimelineEvent = {
  id: string;
  company: string;
  role: string;
  stage: Stage;
  at: string;
  source: 'gmail' | 'calendar' | 'ats' | 'manual';
  confidence: number;
};

type Props = {
  events?: TimelineEvent[];
};

const stageOrder: Stage[] = ['sourced', 'applied', 'screen', 'manager_interview', 'onsite', 'offer', 'closed'];

export const ApplicationTimelineReconstructorV1: React.FC<Props> = ({ events = [] }) => {
  const grouped = useMemo(() => {
    const buckets = new Map<string, TimelineEvent[]>();
    for (const event of events) {
      const key = `${event.company}__${event.role}`;
      const list = buckets.get(key) ?? [];
      list.push(event);
      buckets.set(key, list);
    }

    return [...buckets.entries()].map(([key, list]) => {
      const [company, role] = key.split('__');
      const sorted = [...list].sort((a, b) => stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage));
      const avgConfidence = Math.round(sorted.reduce((sum, e) => sum + e.confidence, 0) / Math.max(sorted.length, 1));
      return { company, role, events: sorted, avgConfidence };
    });
  }, [events]);

  if (!events.length) {
    return (
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}>
        <h3 style={{ margin: 0 }}>Application Timeline Reconstructor v1</h3>
        <p style={{ color: '#6b7280' }}>No event stream found yet (gmail/calendar/ats/manual).</p>
      </section>
    );
  }

  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}>
      <h3 style={{ marginTop: 0 }}>Application Timeline Reconstructor v1</h3>
      <p style={{ color: '#6b7280' }}>Rebuilds per-application journey from fragmented events.</p>

      <div style={{ display: 'grid', gap: 12 }}>
        {grouped.map((row) => (
          <article key={`${row.company}-${row.role}`} style={{ border: '1px solid #f1f5f9', borderRadius: 10, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{row.company} — {row.role}</strong>
              <span style={{ fontSize: 12, color: '#475569' }}>Confidence: {row.avgConfidence}%</span>
            </div>
            <ol style={{ margin: '10px 0 0', paddingInlineStart: 20 }}>
              {row.events.map((event) => (
                <li key={event.id} style={{ marginBottom: 6 }}>
                  <code>{event.stage}</code> · {new Date(event.at).toLocaleDateString()} · {event.source}
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  );
};
