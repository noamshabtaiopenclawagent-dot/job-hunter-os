const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

if (!appTsx.includes('import { RecruiterHandoffContinuityGuardWithOwnershipGapRecoveryPlanner }')) {
  appTsx = appTsx.replace(
    "import { RecruiterWorkloadHeatmap } from './pages/workload/RecruiterWorkloadHeatmap';",
    "import { RecruiterWorkloadHeatmap } from './pages/workload/RecruiterWorkloadHeatmap';\nimport { RecruiterHandoffContinuityGuardWithOwnershipGapRecoveryPlanner } from './pages/dashboard/RecruiterHandoffContinuityGuardWithOwnershipGapRecoveryPlanner';"
  );
}

if (!appTsx.includes("case 'recruiter-handoff-continuity-guard':")) {
  appTsx = appTsx.replace(
    "case 'priority-inbox-triage':",
    "case 'recruiter-handoff-continuity-guard':\n        return <RecruiterHandoffContinuityGuardWithOwnershipGapRecoveryPlanner />;\n      case 'priority-inbox-triage':"
  );
}

fs.writeFileSync('src/App.tsx', appTsx);

let shellTsx = fs.readFileSync('src/components/GlobalNavigationShell.tsx', 'utf8');
if (!shellTsx.includes("id: 'recruiter-handoff-continuity-guard'")) {
  shellTsx = shellTsx.replace(
    "{ id: 'sla-anticipation', label: 'SLA Anticipation' },",
    "{ id: 'recruiter-handoff-continuity-guard', label: 'Recruiter Handoff Guard' },\n      { id: 'sla-anticipation', label: 'SLA Anticipation' },"
  );
}
fs.writeFileSync('src/components/GlobalNavigationShell.tsx', shellTsx);

console.log("Patched correctly");
