import React, { useState, useEffect } from 'react';

export const OfferNegotiationLeverageMapWithConcessionTimingSensitivitySimulator: React.FC = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-4">Offer Negotiation Leverage Map</h2>
      <p className="text-gray-600 mb-6">Analyze negotiation leverage and simulate concession timing.</p>
      
      {loading ? (
        <div className="flex justify-center p-12">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-md">
            <h3 className="font-semibold text-purple-800">Active Negotiations</h3>
            <ul className="mt-2 space-y-2">
              <li className="flex justify-between items-center bg-white p-3 rounded border border-purple-100">
                <span>Candidate G - VP Engineering (Counter-offer received)</span>
                <button className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">Simulate</button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferNegotiationLeverageMapWithConcessionTimingSensitivitySimulator;
