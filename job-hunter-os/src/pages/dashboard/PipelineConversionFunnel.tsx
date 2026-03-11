import React, { useState } from 'react';

type Stage = {
  id: string;
  name: string;
  count: number;
  dropoff: number;
  conversion: number;
};

type Props = {
  stages?: Stage[];
};

export const PipelineConversionFunnel: React.FC<Props> = ({ stages = [] }) => {
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [drilldown, setDrilldown] = useState<string | null>(null);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  if (!stages.length) return <div role="status">No pipeline data available</div>;

  return (
    <div className="funnel-container" style={{ display: 'grid', gap: 16 }}>
      <div className="filters">
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Role Filter">
          <option value="All">All Roles</option>
          <option value="Engineering">Engineering</option>
          <option value="Sales">Sales</option>
        </select>
        <button onClick={handleRefresh}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>

      <div className="stages-grid" style={{ display: 'grid', gap: 8, transition: 'all 0.3s ease' }}>
        {stages.map((stage) => (
          <div key={stage.id} className="stage-card" onClick={() => setDrilldown(stage.id)} style={{ padding: 12, border: '1px solid #ccc', cursor: 'pointer' }}>
            <h3>{stage.name}</h3>
            <div>Candidates: {stage.count}</div>
            <div className="metrics">
              <span className="conversion">Conversion: {stage.conversion}%</span>
              <span className="dropoff">Drop-off: {stage.dropoff}</span>
            </div>
            {drilldown === stage.id && (
              <ul className="drilldown-list">
                <li>Candidate A</li>
                <li>Candidate B</li>
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
