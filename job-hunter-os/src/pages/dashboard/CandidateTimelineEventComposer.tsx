import React, { useState } from 'react';

type EventItem = { id: string; text: string; state: 'pending' | 'success' | 'error' };

export const CandidateTimelineEventComposer: React.FC = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);

  const submit = async () => {
    if (!input.trim()) {
      setError('Event text is required');
      return;
    }
    setError(null);
    const optimistic: EventItem = { id: String(Date.now()), text: input, state: 'pending' };
    setEvents((prev) => [optimistic, ...prev]);
    setInput('');
    try {
      await new Promise((r) => setTimeout(r, 30));
      setEvents((prev) => prev.map((e) => (e.id === optimistic.id ? { ...e, state: 'success' } : e)));
    } catch {
      setEvents((prev) => prev.map((e) => (e.id === optimistic.id ? { ...e, state: 'error' } : e)));
    }
  };

  return (
    <section>
      <h3>Candidate Timeline Event Composer</h3>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr auto' }}>
        <input
          aria-label="Event input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
          }}
          placeholder="Add timeline event"
        />
        <button onClick={submit}>Add Event</button>
      </div>
      {error && <p style={{ color: '#991b1b' }}>{error}</p>}
      <ul>
        {events.map((e) => (
          <li key={e.id}>{e.text} — {e.state}</li>
        ))}
      </ul>
    </section>
  );
};
