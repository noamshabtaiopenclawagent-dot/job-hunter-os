import React, { useState, useEffect } from 'react';

export const OfferPackageCompetitivenessRadarWithConcessionEfficiencyOptimizer: React.FC = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">Offer Package Competitiveness Radar</h2>
      <p className="text-gray-600 mb-6">Optimize concessions efficiently.</p>
      
      {loading ? (
        <div className="flex justify-center p-12">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-100 rounded-md">
            <h3 className="font-semibold text-green-800">Competitive Offers</h3>
            <ul className="mt-2 space-y-2">
              <li className="flex justify-between items-center bg-white p-3 rounded border border-green-100">
                <span>Candidate D - Senior Engineer (95% match)</span>
                <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Approve</button>
              </li>
            </ul>
          </div>
          
          <div className="p-4 bg-red-50 border border-red-100 rounded-md">
            <h3 className="font-semibold text-red-800">At Risk Offers</h3>
            <ul className="mt-2 space-y-2">
              <li className="flex justify-between items-center bg-white p-3 rounded border border-red-100">
                <span>Candidate E - Product Manager (70% match)</span>
                <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Optimize Concessions</button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferPackageCompetitivenessRadarWithConcessionEfficiencyOptimizer;
