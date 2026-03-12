import React, { useState, useEffect } from 'react';

export const InterviewLoopPacingGovernorWithDropoutRiskMitigationSimulator: React.FC = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">Interview Loop Pacing Governor</h2>
      <p className="text-gray-600 mb-6">Manage pacing and simulate dropout risk mitigation.</p>
      
      {loading ? (
        <div className="flex justify-center p-12">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-md">
            <h3 className="font-semibold text-orange-800">High Dropout Risk</h3>
            <ul className="mt-2 space-y-2">
              <li className="flex justify-between items-center bg-white p-3 rounded border border-orange-100">
                <span>Candidate F - Lead Designer (3 weeks in loop)</span>
                <button className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm">Mitigate Risk</button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewLoopPacingGovernorWithDropoutRiskMitigationSimulator;
