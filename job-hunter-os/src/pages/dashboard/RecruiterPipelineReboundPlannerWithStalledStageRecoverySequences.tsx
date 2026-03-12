import React, { useState, useEffect } from 'react';

export const RecruiterPipelineReboundPlannerWithStalledStageRecoverySequences: React.FC = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">Recruiter Pipeline Rebound Planner</h2>
      <p className="text-gray-600 mb-6">Manage stalled stages and execute recovery sequences.</p>
      
      {loading ? (
        <div className="flex justify-center p-12">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-100 rounded-md">
            <h3 className="font-semibold text-red-800">Critical Stalls</h3>
            <ul className="mt-2 space-y-2">
              <li className="flex justify-between items-center bg-white p-3 rounded border border-red-100">
                <span>Candidate A - Technical Interview (14 days)</span>
                <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Execute Recovery</button>
              </li>
              <li className="flex justify-between items-center bg-white p-3 rounded border border-red-100">
                <span>Candidate B - Offer Pending (7 days)</span>
                <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Execute Recovery</button>
              </li>
            </ul>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-md">
            <h3 className="font-semibold text-yellow-800">Warning Stalls</h3>
            <ul className="mt-2 space-y-2">
              <li className="flex justify-between items-center bg-white p-3 rounded border border-yellow-100">
                <span>Candidate C - HM Screen (5 days)</span>
                <button className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm">Send Nudge</button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterPipelineReboundPlannerWithStalledStageRecoverySequences;
