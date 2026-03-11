import React, { useState } from 'react';
import { useTelemetry } from '../providers/TelemetryProvider';

type NavItem = {
  id: string;
  label: string;
  icon?: string;
};

const defaultNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'review-backlog-cleanup', label: 'Review Backlog Cleanup', icon: '✅' },
  { id: 'roadmap-mapping', label: 'Roadmap Artifact Mapping', icon: '🗺️' },
  { id: 'israel-source-hardening', label: 'Israel Source Hardening', icon: '🇮🇱' },
  { id: 'cv-jd-calibration', label: 'CV-JD Calibration', icon: '🎯' },
  { id: 'dashboard-actionability', label: 'Dashboard Actionability', icon: '⚡' },
  { id: 'org-tree-ux-hardening', label: 'Org Tree UX Hardening', icon: '🌳' },
  { id: 'evergreen-cycle', label: 'Evergreen Improvement', icon: '♻️' },
  { id: 'error-telemetry-unification', label: 'Error Telemetry Unification', icon: '🩺' },
  { id: 'qa-fail-opi-triage', label: 'QA FAIL OPI Triage', icon: '🛑' },
  { id: 'pipeline-funnel', label: 'Pipeline Funnel', icon: '🌪️' },
  { id: 'scanner-diagnostics-modal', label: 'Scanner Diagnostics Modal', icon: '🧪' },
  { id: 'sourcing-radar', label: 'Sourcing Velocity Radar', icon: '📡' },
  { id: 'journey-friction-heatmap', label: 'Journey Friction Heatmap', icon: '🧭' },
  { id: 'workload-heatmap', label: 'Recruiter Workload Heatmap', icon: '🔥' },
  { id: 'priority-inbox-triage', label: 'Priority Inbox Smart Triage', icon: '📥' },
  { id: 'sla-anticipation', label: 'SLA Breach Anticipation', icon: '⏱️' },
  { id: 'offer-stability', label: 'Offer Negotiation Stability', icon: '🤝' },
  { id: 'offer-decision-canvas', label: 'Offer Decision Collaboration', icon: '🧩' },
  { id: 'interview-reliability', label: 'Interview Panel Reliability', icon: '📝' },
];

type Props = {
  children: React.ReactNode;
  activeViewId: string;
  onNavigate: (id: string) => void;
};

export const GlobalNavigationShell: React.FC<Props> = ({ children, activeViewId, onNavigate }) => {
  const { connected, lastUpdated } = useTelemetry();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb' }}>
      {/* Sidebar Navigation */}
      <nav 
        style={{ 
          width: isSidebarOpen ? 260 : 64, 
          backgroundColor: '#1f2937', 
          color: '#f3f4f6', 
          transition: 'width 0.2s', 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', borderBottom: '1px solid #374151' }}>
          {isSidebarOpen && <span style={{ fontWeight: 'bold', fontSize: '18px', letterSpacing: '-0.5px' }}>Job Hunter OS</span>}
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}
            aria-label="Toggle Sidebar"
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, flexGrow: 1 }}>
          {defaultNavItems.map(item => (
            <li key={item.id}>
              <button 
                onClick={() => onNavigate(item.id)}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '12px 16px', 
                  background: activeViewId === item.id ? '#374151' : 'transparent', 
                  border: 'none', 
                  color: activeViewId === item.id ? '#ffffff' : '#d1d5db', 
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <span style={{ fontSize: '18px', minWidth: 28, textAlign: 'center' }}>{item.icon}</span>
                {isSidebarOpen && <span style={{ marginLeft: 12 }}>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>

        {/* Telemetry Status Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #374151', fontSize: '12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: connected ? '#10b981' : '#ef4444' }} />
          {isSidebarOpen && (
            <span style={{ color: '#9ca3af' }}>
              {connected ? 'Live' : 'Disconnected'} 
              {lastUpdated && ` • ${new Date(lastUpdated).toLocaleTimeString()}`}
            </span>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 56, backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
            {defaultNavItems.find(i => i.id === activeViewId)?.label || 'View'}
          </h2>
        </header>
        
        <div style={{ flexGrow: 1, padding: 24, overflowY: 'auto' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
