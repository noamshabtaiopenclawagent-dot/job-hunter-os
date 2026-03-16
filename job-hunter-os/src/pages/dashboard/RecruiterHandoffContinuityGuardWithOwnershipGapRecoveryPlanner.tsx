import React, { useState, useEffect } from 'react';

interface GapCandidate {
  id: string;
  name: string;
  role: string;
  unassignedHours: number;
  criticality: 'High' | 'Medium' | 'Low';
}

export const RecruiterHandoffContinuityGuardWithOwnershipGapRecoveryPlanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gaps, setGaps] = useState<GapCandidate[]>([]);

  const fetchGaps = () => {
    setLoading(true);
    setError(null);
    // Simulate API fetch
    setTimeout(() => {
      try {
        setGaps([
          { id: '1', name: 'Candidate H', role: 'Fullstack Dev', unassignedHours: 48, criticality: 'High' },
          { id: '2', name: 'Candidate M', role: 'Product Manager', unassignedHours: 24, criticality: 'Medium' },
        ]);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch handoff gaps');
        setLoading(false);
      }
    }, 500);
  };

  useEffect(() => {
    fetchGaps();
  }, []);

  const handleRecover = (id: string) => {
    setGaps(prev => prev.filter(gap => gap.id !== id));
  };

  if (error) {
    return (
      <div role="alert" className="p-4 bg-red-100 text-red-900 border border-red-300 rounded-md">
        {error}
        <button onClick={fetchGaps} className="ml-4 px-3 py-1 bg-red-600 text-white rounded">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200" aria-busy={loading}>
      <h2 className="text-2xl font-bold mb-4">Recruiter Handoff Continuity Guard</h2>
      <p className="text-gray-600 mb-6">Monitor handoff continuity and plan ownership gap recovery.</p>
      
      {loading ? (
        <div role="status" className="flex justify-center p-12">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></span>
          <span className="sr-only">Loading gaps...</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-100 rounded-md">
            <h3 className="font-semibold text-red-800">Critical Handoff Gaps ({gaps.length})</h3>
            {gaps.length === 0 ? (
              <p className="mt-2 text-green-700 font-medium">No gaps detected. Handoff continuity is stable.</p>
            ) : (
              <ul className="mt-2 space-y-2" aria-label="List of handoff gaps">
                {gaps.map(gap => (
                  <li key={gap.id} className="flex justify-between items-center bg-white p-3 rounded border border-red-100">
                    <span>
                      <strong>{gap.name}</strong> - {gap.role} 
                      <span className="ml-2 text-sm text-gray-500">(Unassigned for {gap.unassignedHours}h)</span>
                    </span>
                    <button 
                      onClick={() => handleRecover(gap.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors"
                      aria-label={`Recover ownership for ${gap.name}`}
                    >
                      Recover Ownership
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterHandoffContinuityGuardWithOwnershipGapRecoveryPlanner;
