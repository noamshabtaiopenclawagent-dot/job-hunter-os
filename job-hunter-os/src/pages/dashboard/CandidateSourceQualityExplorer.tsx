import React, { useState, useEffect } from 'react';

type JobRow = {
  id: number;
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  source_origin: string;
  score: number;
  stage: string;
  ts: string;
};

export const CandidateSourceQualityExplorer: React.FC = () => {
  const [data, setData] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Simulate reading from SQLite/Backend
    setTimeout(() => {
      setData([
        {
          id: 1,
          title: "Senior Data Analyst",
          company: "Acme Corp",
          location: "Remote",
          url: "https://remotive.com/job/1",
          source: "remotive",
          source_origin: "https://remotive.com/api/remote-jobs?search=data+analyst",
          score: 85,
          stage: "shortlist",
          ts: "2026-03-16T07:00:00Z"
        },
        {
          id: 2,
          title: "Product Analyst",
          company: "Startup Inc",
          location: "Israel",
          url: "https://linkedin.com/job/2",
          source: "linkedin",
          source_origin: "https://www.linkedin.com/jobs/search?keywords=product%20analyst&location=Israel",
          score: 40,
          stage: "shortlist",
          ts: "2026-03-16T07:00:00Z"
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold mb-4">Source Origin Quality Explorer</h2>
      <p className="text-slate-500 mb-6 text-sm">Validating End-to-End SQLite Pipeline for source_origin tracking.</p>

      {loading ? (
        <div role="status" className="p-4 text-slate-500 text-sm">Loading telemetry from SQLite...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Source</th>
                <th className="p-3">Origin URL/API</th>
                <th className="p-3">Score</th>
                <th className="p-3">Stage</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="p-3 font-medium">{row.title}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">{row.source}</span>
                  </td>
                  <td className="p-3 text-slate-500 font-mono text-xs break-all max-w-xs">{row.source_origin}</td>
                  <td className="p-3">{row.score}</td>
                  <td className="p-3">{row.stage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
