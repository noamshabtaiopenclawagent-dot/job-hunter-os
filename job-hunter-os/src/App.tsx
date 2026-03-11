import React, { useState } from 'react';
import { TelemetryProvider } from './providers/TelemetryProvider';
import { GlobalNavigationShell } from './components/GlobalNavigationShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { CandidateSourcingVelocityRadar } from './pages/dashboard/CandidateSourcingVelocityRadar';
import { RoadmapShippedArtifactsMappingBoard } from './pages/dashboard/RoadmapShippedArtifactsMappingBoard';
import { ReviewBacklogCleanupEvidenceConsole } from './pages/dashboard/ReviewBacklogCleanupEvidenceConsole';
import { IsraelFirstSourceConnectorsHardeningQualityGate } from './pages/dashboard/IsraelFirstSourceConnectorsHardeningQualityGate';
import { CvJdExplainableMatchCalibrationThresholdTuning } from './pages/dashboard/CvJdExplainableMatchCalibrationThresholdTuning';
import { DashboardActionabilityUpgradeDecisionActions } from './pages/dashboard/DashboardActionabilityUpgradeDecisionActions';
import { OrgTreeUxHardeningRoleBasedNavigationClarity } from './pages/dashboard/OrgTreeUxHardeningRoleBasedNavigationClarity';
import { EvergreenImprovementCycleBoard } from './pages/dashboard/EvergreenImprovementCycleBoard';
import { DashboardErrorTelemetryUnificationPanel } from './pages/dashboard/DashboardErrorTelemetryUnificationPanel';
import { QaFailOpiDecisionTriagePanel } from './pages/dashboard/QaFailOpiDecisionTriagePanel';
import { ScannerSourceDiagnosticsModal } from './pages/dashboard/ScannerSourceDiagnosticsModal';
import { ScannerOutageIncidentBanner } from './pages/dashboard/ScannerOutageIncidentBanner';
import { CandidateStageSlaClockBadges } from './pages/dashboard/CandidateStageSlaClockBadges';
import { RoleFunnelDeltaExplorerChart } from './pages/dashboard/RoleFunnelDeltaExplorerChart';
import { ScannerIncidentHistoryTimelineDrawer } from './pages/dashboard/ScannerIncidentHistoryTimelineDrawer';
import { MatchShortlistActionRail } from './pages/dashboard/MatchShortlistActionRail';
import { SourceLevelDedupeImpactDashboardCard } from './pages/dashboard/SourceLevelDedupeImpactDashboardCard';
import { ScannerRecoveryActionsCommandPalette } from './pages/dashboard/ScannerRecoveryActionsCommandPalette';
import { CrossRoleStageThroughputComparisonBoard } from './pages/dashboard/CrossRoleStageThroughputComparisonBoard';
import { CandidateTimelineEventComposer } from './pages/dashboard/CandidateTimelineEventComposer';
import { ScannerSourcePauseResumeStatusRibbon } from './pages/dashboard/ScannerSourcePauseResumeStatusRibbon';
import { CandidateShortlistConflictResolverModal } from './pages/dashboard/CandidateShortlistConflictResolverModal';
import { FunnelStageAnomalyAlertStrip } from './pages/dashboard/FunnelStageAnomalyAlertStrip';
import { ScannerActionAuditTrailPanel } from './pages/dashboard/ScannerActionAuditTrailPanel';
import { CandidateMatchDriftIndicatorCards } from './pages/dashboard/CandidateMatchDriftIndicatorCards';
import { PipelineConversionFunnel } from './pages/dashboard/PipelineConversionFunnel';
import { PipelineHandoffReadinessChecklistDrawer } from './pages/dashboard/PipelineHandoffReadinessChecklistDrawer';
import { ScannerSourceSlaBreachHeatmap } from './pages/dashboard/ScannerSourceSlaBreachHeatmap';
import { RecruiterWorkloadHeatmap } from './pages/workload/RecruiterWorkloadHeatmap';
import { OfferStabilityTuner } from './pages/offer/OfferStabilityTuner';
import { RecruiterPriorityInboxSmartTriageWorkspace } from './pages/triage/RecruiterPriorityInboxSmartTriageWorkspace';
import { CandidateJourneyFrictionHeatmapWithInterventionDesigner } from './pages/dashboard/CandidateJourneyFrictionHeatmapWithInterventionDesigner';
import { OfferDecisionCollaborationCanvasWithConsensusSignals } from './pages/offer/OfferDecisionCollaborationCanvasWithConsensusSignals';

// Extended mock data for the sourcing radar until backend wiring is complete
const mockSourcingData = [
  { id: '1', role: 'Frontend Engineer', channel: 'linkedin' as const, velocityPerWeek: 12, costPerHire: 8500, qualityBaseline: 78, pipelineConversionRate: 4.2, timeToFillBaseline: 35, budgetAllocation: 15000 },
  { id: '2', role: 'Frontend Engineer', channel: 'referral' as const, velocityPerWeek: 3, costPerHire: 3000, qualityBaseline: 92, pipelineConversionRate: 15.5, timeToFillBaseline: 22, budgetAllocation: 5000 },
  { id: '3', role: 'Backend Engineer', channel: 'agency' as const, velocityPerWeek: 5, costPerHire: 22000, qualityBaseline: 85, pipelineConversionRate: 8.5, timeToFillBaseline: 28, budgetAllocation: 45000 },
  { id: '4', role: 'Data Scientist', channel: 'outbound' as const, velocityPerWeek: 8, costPerHire: 6500, qualityBaseline: 82, pipelineConversionRate: 6.5, timeToFillBaseline: 40, budgetAllocation: 25000 },
];

const mockRoadmapMappings = [
  {
    id: 'rm1',
    name: 'Offer Decision Collaboration Canvas',
    path: '/src/pages/offer/OfferDecisionCollaborationCanvasWithConsensusSignals.tsx',
    stage: 'phase-0' as const,
    status: 'ready_reuse' as const,
    integrationDelta: 'Integrated into App route + global nav + offer module test coverage',
    kpiProof: 'Committed integrated slice with consensus timeline, blockers lane, optimistic actions',
    reusableOutputs: ['Consensus scoring utility', 'Optimistic comment persistence pattern', 'Blocker lane interaction model'],
  },
  {
    id: 'rm2',
    name: 'Candidate Journey Friction Heatmap',
    path: '/src/pages/dashboard/CandidateJourneyFrictionHeatmapWithInterventionDesigner.tsx',
    stage: 'phase-1' as const,
    status: 'pending_validation' as const,
    integrationDelta: 'Integrated into dashboard nav with role/source/stage filters and intervention side panel',
    kpiProof: 'Committed route-integrated slice with what-if projection chips and partial telemetry state handling',
    reusableOutputs: ['Heatmap color-scale thresholds', 'Intervention projection model', 'Partial telemetry guardrails'],
  },
  {
    id: 'rm3',
    name: 'Recruiter Priority Inbox Smart Triage',
    path: '/src/pages/triage/RecruiterPriorityInboxSmartTriageWorkspace.tsx',
    stage: 'phase-1' as const,
    status: 'mapped' as const,
    integrationDelta: 'Integrated triage route + nav + bulk action keyboard flow',
    kpiProof: 'Committed integrated slice with assign/snooze/escalate optimistic rollback behavior',
    reusableOutputs: ['Bulk action optimistic rollback handler', 'Saved filter presets pattern', 'Rationale drawer interaction shell'],
  },
];

const mockReviewCleanupTasks = [
  {
    id: 'rv1',
    title: '[JHOS-P1] Offer Decision Collaboration Canvas verification',
    artifactPath: '/src/pages/offer/OfferDecisionCollaborationCanvasWithConsensusSignals.tsx',
    integrationDelta: 'App route + nav + offer domain integration + test coverage',
    kpiProof: 'Consensus/thread/blocker/one-click actions verified in integrated view',
    evidenceLinks: ['commit:7adc088', 'test:OfferDecisionCollaborationCanvasWithConsensusSignals.test.tsx'],
    verified: true,
    closed: false,
  },
  {
    id: 'rv2',
    title: '[JHOS-P1] Candidate Journey Friction Heatmap verification',
    artifactPath: '/src/pages/dashboard/CandidateJourneyFrictionHeatmapWithInterventionDesigner.tsx',
    integrationDelta: 'Dashboard route + nav + intervention designer + projection chips',
    kpiProof: 'Heatmap filters/drilldown/projection behavior validated via integrated flow',
    evidenceLinks: ['commit:e755f8d', 'test:CandidateJourneyFrictionHeatmapWithInterventionDesigner.test.tsx'],
    verified: true,
    closed: false,
  },
  {
    id: 'rv3',
    title: '[JHOS-P1] Recruiter Priority Inbox Smart Triage verification',
    artifactPath: '/src/pages/triage/RecruiterPriorityInboxSmartTriageWorkspace.tsx',
    integrationDelta: 'Triage route + nav + bulk keyboard action workflow',
    kpiProof: 'Optimistic assign/snooze/escalate behavior validated',
    evidenceLinks: ['commit:4afa146', 'test:RecruiterPriorityInboxSmartTriageWorkspace.test.tsx'],
    verified: true,
    closed: false,
  },
];

const mockIsraelSourceHardeningData = [
  { id: 'is1', source: 'AllJobs IL', region: 'israel' as const, status: 'healthy' as const, latencyMs: 420, successRate: 98, parsedJobs: 220, uniqueJobs: 174, qualityScore: 86 },
  { id: 'is2', source: 'Drushim', region: 'israel' as const, status: 'degraded' as const, latencyMs: 980, successRate: 88, parsedJobs: 160, uniqueJobs: 105, qualityScore: 69, lastError: 'Rate-limit burst protection' },
  { id: 'is3', source: 'LinkedIn ISR', region: 'israel' as const, status: 'healthy' as const, latencyMs: 510, successRate: 95, parsedJobs: 300, uniqueJobs: 218, qualityScore: 82, partial: true },
  { id: 'is4', source: 'Global Agency Feed', region: 'global' as const, status: 'down' as const, latencyMs: 2200, successRate: 40, parsedJobs: 85, uniqueJobs: 42, qualityScore: 51, lastError: 'Auth token expired' },
];

const mockCvJdCalibrationData = [
  { id: 'm1', candidate: 'Yael Ben-David', role: 'Data Analyst', skillsFit: 84, domainFit: 72, seniorityFit: 78, locationFit: 95, historicalOutcome: 'advanced' as const },
  { id: 'm2', candidate: 'Omer Levi', role: 'Product Analyst', skillsFit: 69, domainFit: 80, seniorityFit: 66, locationFit: 88, historicalOutcome: 'rejected' as const },
  { id: 'm3', candidate: 'Noga Cohen', role: 'Business Analyst', skillsFit: 91, domainFit: 85, seniorityFit: 82, locationFit: 75, historicalOutcome: 'offer' as const },
  { id: 'm4', candidate: 'Roi Azulai', role: 'Data Engineer', skillsFit: 58, domainFit: 62, seniorityFit: 70, locationFit: 81, historicalOutcome: 'rejected' as const, partial: true },
];

const mockDashboardDecisionActions = [
  { id: 'da1', title: 'Re-route aging interview loops', owner: 'Recruiting Ops', module: 'Journey Heatmap', etaHours: 4, expectedImpact: 'Reduce interview-stage drop-offs in overloaded cohorts', priority: 'critical' as const, kpiDelta: 8, status: 'open' as const },
  { id: 'da2', title: 'Escalate stalled offer approvals', owner: 'Finance Partner', module: 'Offer Decision Canvas', etaHours: 2, expectedImpact: 'Shorten approval cycle time for high-confidence offers', priority: 'high' as const, kpiDelta: 6, status: 'open' as const },
  { id: 'da3', title: 'Rebalance recruiter triage ownership', owner: 'Talent Lead', module: 'Priority Inbox Triage', etaHours: 6, expectedImpact: 'Lower SLA breach probability in high-density queues', priority: 'medium' as const, kpiDelta: 4, status: 'open' as const },
];

const mockOrgTreeNodes = [
  { id: 'org1', name: 'OPI', role: 'lead' as const, parentId: null, active: true, workload: 72, approvalsPending: 3, slaRisk: 44, priorityAction: 'Approve backlog closure order' },
  { id: 'org2', name: 'BOB', role: 'recruiter' as const, parentId: 'org1', active: true, workload: 84, approvalsPending: 2, slaRisk: 61, priorityAction: 'Escalate stalled offer approvals' },
  { id: 'org3', name: 'MAYA', role: 'analyst' as const, parentId: 'org1', active: true, workload: 61, approvalsPending: 1, slaRisk: 33, priorityAction: 'Recalibrate CV-JD threshold' },
  { id: 'org4', name: 'NOA', role: 'coordinator' as const, parentId: 'org1', active: false, workload: 32, approvalsPending: 5, slaRisk: 72, priorityAction: 'Resolve interview scheduling queue' },
];

const mockEvergreenInsights = [
  { id: 'ev1', module: 'Dashboard Actionability', metric: 'Action completion visibility', baseline: 52, current: 83, note: 'Owner/ETA/action status now visible in one panel with decision-action lifecycle.' },
  { id: 'ev2', module: 'Org Tree UX', metric: 'Role-route clarity', baseline: 48, current: 82, note: 'Role-based navigation guidance + hierarchy drilldown improved routing clarity.' },
];

const mockEvergreenProposals = [
  { id: 'ep1', title: 'Cross-module Decision Inbox Unifier', rationale: 'Unify decision actions from triage/offer/dashboard into one queue to cut context-switching and improve execution latency.', approvalRequired: true, status: 'draft' as const, impactScore: 87 },
  { id: 'ep2', title: 'Auto-Calibrating KPI Guardrails Engine', rationale: 'Use rolling outcomes to auto-adjust thresholds (risk, quality, SLA) and reduce manual tuning drift.', approvalRequired: true, status: 'draft' as const, impactScore: 82 },
];

const mockErrorTelemetryModules = [
  { module: 'Dashboard Actionability', localErrorRate: 7.4, fallbackActive: false },
  { module: 'Org Tree UX Hardening', localErrorRate: 11.8, fallbackActive: true },
  { module: 'Evergreen Improvement', localErrorRate: 5.6, fallbackActive: false },
];

const mockScannerDiagnosticsSource = {
  id: 'sd1',
  source: 'AllJobs IL',
  latencySeries: [320, 410, 380, 520, 460, 430],
  failureMeta: [
    { key: 'last_error', value: 'HTTP 429' },
    { key: 'retry_count', value: '3' },
    { key: 'window', value: '5m' },
  ],
  status: 'ready' as const,
};

const mockWorkloadData = [
  { id: '1', recruiter: 'Alice Smith', department: 'Engineering', complexity: 'high' as const, activeReqs: 12, candidatesInProcess: 85, workloadDensityScore: 92, burnoutRiskBaseline: 88, slaDegradationBaseline: 65, continuityFailureBaseline: 45 },
  { id: '2', recruiter: 'Bob Jones', department: 'Sales', complexity: 'medium' as const, activeReqs: 8, candidatesInProcess: 40, workloadDensityScore: 65, burnoutRiskBaseline: 45, slaDegradationBaseline: 20, continuityFailureBaseline: 15 },
  { id: '3', recruiter: 'Charlie Davis', department: 'Design', complexity: 'specialized' as const, activeReqs: 5, candidatesInProcess: 25, workloadDensityScore: 78, burnoutRiskBaseline: 60, slaDegradationBaseline: 35, continuityFailureBaseline: 25 },
  { id: '4', recruiter: 'Diana Prince', department: 'Engineering', complexity: 'low' as const, activeReqs: 22, candidatesInProcess: 150, workloadDensityScore: 85, burnoutRiskBaseline: 75, slaDegradationBaseline: 50, continuityFailureBaseline: 40 },
];

const mockOfferData = [
  { id: 'c1', name: 'Jane Doe', role: 'Staff Engineer', department: 'Engineering', compExpectationMin: 180000, compExpectationMax: 220000, compPushed: true, marketRatePercentile: 90, competingOffers: 2, timeInProcessDays: 32, interviewScoreAvg: 8.5, flightRiskFlags: ['Another offer expiring soon'] },
  { id: 'c2', name: 'John Smith', role: 'Product Manager', department: 'Product', compExpectationMin: 140000, compExpectationMax: 160000, compPushed: false, marketRatePercentile: 75, competingOffers: 0, timeInProcessDays: 45, interviewScoreAvg: 7.2, flightRiskFlags: ['Process fatigue'] },
];

const mockTriageData = [
  { id: 't1', candidateName: 'Lena Cohen', role: 'Senior Data Analyst', recruiter: 'Alice Smith', stage: 'interview' as const, slaHoursRemaining: 4, stageUrgency: 82, expectedConversionLift: 71, slaRisk: 79, owner: 'alice', blockedBy: 'Pending debrief summary' },
  { id: 't2', candidateName: 'Noa Levi', role: 'Product Analyst', recruiter: 'Bob Jones', stage: 'offer' as const, slaHoursRemaining: -6, stageUrgency: 95, expectedConversionLift: 86, slaRisk: 92, owner: 'bob', blockedBy: 'Compensation approval chain' },
  { id: 't3', candidateName: 'Idan Bar', role: 'Business Analyst', recruiter: 'Alice Smith', stage: 'screen' as const, slaHoursRemaining: 18, stageUrgency: 54, expectedConversionLift: 48, slaRisk: 51, owner: 'alice', partial: true },
  { id: 't4', candidateName: 'Maya Azulay', role: 'Data Engineer', recruiter: 'Diana Prince', stage: 'closing' as const, slaHoursRemaining: 2, stageUrgency: 88, expectedConversionLift: 90, slaRisk: 84, owner: 'diana' },
];

const mockJourneyFrictionData = [
  { id: 'f1', role: 'Data Analyst' as const, source: 'linkedin' as const, stage: 'applied' as const, volume: 140, dropOffRate: 18, avgCycleDays: 6, drivers: [{ label: 'Slow first response', impact: 34 }, { label: 'Low signal JD', impact: 20 }] },
  { id: 'f2', role: 'Data Analyst' as const, source: 'linkedin' as const, stage: 'screen' as const, volume: 110, dropOffRate: 29, avgCycleDays: 9, drivers: [{ label: 'Scheduling lag', impact: 37 }, { label: 'Rubric mismatch', impact: 22 }], partial: true },
  { id: 'f3', role: 'Data Analyst' as const, source: 'linkedin' as const, stage: 'interview' as const, volume: 75, dropOffRate: 33, avgCycleDays: 12, drivers: [{ label: 'Panel inconsistency', impact: 41 }] },
  { id: 'f4', role: 'Product Analyst' as const, source: 'referral' as const, stage: 'screen' as const, volume: 80, dropOffRate: 14, avgCycleDays: 7, drivers: [{ label: 'Minor scope ambiguity', impact: 15 }] },
  { id: 'f5', role: 'Product Analyst' as const, source: 'referral' as const, stage: 'interview' as const, volume: 54, dropOffRate: 21, avgCycleDays: 10, drivers: [{ label: 'Case-study turnaround', impact: 29 }] },
  { id: 'f6', role: 'Business Analyst' as const, source: 'agency' as const, stage: 'offer' as const, volume: 31, dropOffRate: 47, avgCycleDays: 15, drivers: [{ label: 'Comp mismatch', impact: 52 }, { label: 'Approval latency', impact: 33 }] },
  { id: 'f7', role: 'Data Engineer' as const, source: 'outbound' as const, stage: 'screen' as const, volume: 68, dropOffRate: 24, avgCycleDays: 8, drivers: [{ label: 'Outreach personalization gap', impact: 31 }] },
  { id: 'f8', role: 'Data Engineer' as const, source: 'outbound' as const, stage: 'interview' as const, volume: 40, dropOffRate: 28, avgCycleDays: 11, drivers: [{ label: 'Interviewer load contention', impact: 36 }] },
];

const mockOfferConsensusSignals = [
  { id: 'os1', participant: 'Alice (Recruiter)', role: 'recruiter' as const, confidence: 72, stance: 'counter' as const, note: 'Candidate expects adjusted equity band', updatedAt: '2026-03-10T14:10:00Z' },
  { id: 'os2', participant: 'Dana (Hiring Manager)', role: 'hiring_manager' as const, confidence: 81, stance: 'approve' as const, note: 'Strong business case and urgency', updatedAt: '2026-03-10T14:18:00Z' },
  { id: 'os3', participant: 'Finance Approver', role: 'approver' as const, confidence: 58, stance: 'hold' as const, note: 'Need comp-band confirmation', updatedAt: '2026-03-10T14:26:00Z' },
];

const mockOfferConsensusComments = [
  { id: 'oc1', author: 'Alice', role: 'recruiter' as const, tag: 'counter' as const, text: 'Recommend targeted equity adjustment to preserve close probability.' },
  { id: 'oc2', author: 'Dana', role: 'hiring_manager' as const, tag: 'approve' as const, text: 'Role-critical hire; delay will impact Q2 delivery.' },
  { id: 'oc3', author: 'Finance', role: 'approver' as const, tag: 'hold' as const, text: 'Need updated peer comp reference before final sign-off.' },
];

const mockOfferConsensusBlockers = [
  { id: 'ob1', label: 'Comp-band exception validation', owner: 'Finance', severity: 'high' as const, resolved: false },
  { id: 'ob2', label: 'Final VP approval slot', owner: 'VP People', severity: 'medium' as const, resolved: false },
];

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState('offer-stability');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0' }}>Welcome to Job Hunter OS</h3>
              <p style={{ margin: 0, color: '#4b5563' }}>Select a module from the sidebar to view live telemetry and perform what-if simulations.</p>
            </div>
          </div>
        );
      case 'review-backlog-cleanup':
        return <ReviewBacklogCleanupEvidenceConsole tasks={mockReviewCleanupTasks} />;
      case 'roadmap-mapping':
        return <RoadmapShippedArtifactsMappingBoard items={mockRoadmapMappings} />;
      case 'israel-source-hardening':
        return <IsraelFirstSourceConnectorsHardeningQualityGate data={mockIsraelSourceHardeningData} onManualRefresh={async () => { await new Promise((resolve) => setTimeout(resolve, 120)); }} />;
      case 'cv-jd-calibration':
        return <CvJdExplainableMatchCalibrationThresholdTuning data={mockCvJdCalibrationData} />;
      case 'dashboard-actionability':
        return <DashboardActionabilityUpgradeDecisionActions actions={mockDashboardDecisionActions} />;
      case 'org-tree-ux-hardening':
        return <OrgTreeUxHardeningRoleBasedNavigationClarity nodes={mockOrgTreeNodes} signalsEndpoint="/api/org-tree/risk-signals" intentsEndpoint="/api/org-tree/intent-signals" qaOwner="Alex" />;
      case 'evergreen-cycle':
        return <EvergreenImprovementCycleBoard insights={mockEvergreenInsights} proposals={mockEvergreenProposals} onCreateApprovalRequest={async (proposalId) => ({ requestId: `BOARD-APR-${proposalId}` })} />;
      case 'error-telemetry-unification':
        return <DashboardErrorTelemetryUnificationPanel localModules={mockErrorTelemetryModules} />;
      case 'qa-fail-opi-triage':
        return <QaFailOpiDecisionTriagePanel taskId="2fc130df-14b4-4379-8b48-2d0326f731a1" qaTaskId="90c889f2-15a6-47ae-8e00-f5639b0570fb" issueTitle="[JHOS-DEV] Scanner source SLA breach heatmap" checksRequired={8} risk="medium" checks={[
          { id: 'C1', behavior: 'Hourly per-source heatmap cells render', expectedEvidence: 'Cell label/time assertions', kpi: 'visibility' },
          { id: 'C2', behavior: 'Severity color scale applied', expectedEvidence: 'High severity style assertion', kpi: 'risk salience' },
          { id: 'C3', behavior: 'Role filter works', expectedEvidence: 'Role filter interaction + narrowed result', kpi: 'filter precision' },
          { id: 'C4', behavior: 'Source filter works', expectedEvidence: 'Source filter interaction + narrowed result', kpi: 'filter precision' },
          { id: 'C5', behavior: 'Hover titles include context', expectedEvidence: 'title attribute assertion', kpi: 'explainability' },
          { id: 'C6', behavior: 'Cell click opens incident drilldown', expectedEvidence: 'status message assertion after click', kpi: 'drilldown speed' },
          { id: 'C7', behavior: 'Compact mode supports rendering', expectedEvidence: 'compact render assertion', kpi: 'density flexibility' },
          { id: 'C8', behavior: 'Loading/empty/error states handled', expectedEvidence: 'state fallback assertions', kpi: 'state reliability' },
        ]} />;
      case 'scanner-diagnostics-modal':
        return <ScannerSourceDiagnosticsModal open source={mockScannerDiagnosticsSource} />;
      case 'scanner-outage-banner':
        return <ScannerOutageIncidentBanner onOpenDiagnostics={() => setActiveView('scanner-diagnostics-modal')} />;
      case 'candidate-stage-sla-clock-badges':
        return <CandidateStageSlaClockBadges />;
      case 'role-funnel-delta-explorer-chart':
        return <RoleFunnelDeltaExplorerChart />;
      case 'scanner-incident-history-timeline-drawer':
        return <ScannerIncidentHistoryTimelineDrawer />;
      case 'match-shortlist-action-rail':
        return <MatchShortlistActionRail />;
      case 'source-level-dedupe-impact-dashboard-card':
        return <SourceLevelDedupeImpactDashboardCard />;
      case 'scanner-recovery-actions-command-palette':
        return <ScannerRecoveryActionsCommandPalette />;
      case 'cross-role-stage-throughput-comparison-board':
        return <CrossRoleStageThroughputComparisonBoard />;
      case 'candidate-timeline-event-composer':
        return <CandidateTimelineEventComposer />;
      case 'scanner-source-pause-resume-status-ribbon':
        return <ScannerSourcePauseResumeStatusRibbon />;
      case 'candidate-shortlist-conflict-resolver-modal':
        return <CandidateShortlistConflictResolverModal />;
      case 'funnel-stage-anomaly-alert-strip':
        return <FunnelStageAnomalyAlertStrip />;
      case 'scanner-action-audit-trail-panel':
        return <ScannerActionAuditTrailPanel />;
      case 'candidate-match-drift-indicator-cards':
        return <CandidateMatchDriftIndicatorCards />;
      case 'pipeline-funnel':
        return <PipelineConversionFunnel />;
      case 'pipeline-handoff-readiness-checklist-drawer':
        return <PipelineHandoffReadinessChecklistDrawer />;
      case 'scanner-source-sla-breach-heatmap':
        return <ScannerSourceSlaBreachHeatmap />;
      case 'sourcing-radar':
        return <CandidateSourcingVelocityRadar data={mockSourcingData} />;
      case 'journey-friction-heatmap':
        return <CandidateJourneyFrictionHeatmapWithInterventionDesigner data={mockJourneyFrictionData} />;
      case 'workload-heatmap':
        return <RecruiterWorkloadHeatmap data={mockWorkloadData} />;
      case 'offer-stability':
        return <OfferStabilityTuner data={mockOfferData} />;
      case 'offer-decision-canvas':
        return <OfferDecisionCollaborationCanvasWithConsensusSignals signals={mockOfferConsensusSignals} comments={mockOfferConsensusComments} blockers={mockOfferConsensusBlockers} />;
      case 'priority-inbox-triage':
        return <RecruiterPriorityInboxSmartTriageWorkspace data={mockTriageData} />;
      case 'sla-anticipation':
        return <div>SLA Anticipation Module Integration Pending...</div>;
      case 'interview-reliability':
        return <div>Interview Reliability Module Integration Pending...</div>;
      default:
        return <div>View not found.</div>;
    }
  };

  return (
    <ErrorBoundary>
      <TelemetryProvider endpointUrl="/api/telemetry/stream" pollIntervalMs={15000}>
        <GlobalNavigationShell activeViewId={activeView} onNavigate={setActiveView}>
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </GlobalNavigationShell>
      </TelemetryProvider>
    </ErrorBoundary>
  );
};

export default App;

