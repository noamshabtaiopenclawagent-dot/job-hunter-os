const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

if (!appTsx.includes('import { CandidateSourceQualityExplorer }')) {
  appTsx = appTsx.replace(
    "import { RecruiterHandoffContinuityGuardWithOwnershipGapRecoveryPlanner } from './pages/dashboard/RecruiterHandoffContinuityGuardWithOwnershipGapRecoveryPlanner';",
    "import { RecruiterHandoffContinuityGuardWithOwnershipGapRecoveryPlanner } from './pages/dashboard/RecruiterHandoffContinuityGuardWithOwnershipGapRecoveryPlanner';\nimport { CandidateSourceQualityExplorer } from './pages/dashboard/CandidateSourceQualityExplorer';"
  );
}

if (!appTsx.includes("case 'candidate-source-quality-explorer':")) {
  appTsx = appTsx.replace(
    "case 'recruiter-handoff-continuity-guard':",
    "case 'candidate-source-quality-explorer':\n        return <CandidateSourceQualityExplorer />;\n      case 'recruiter-handoff-continuity-guard':"
  );
}

fs.writeFileSync('src/App.tsx', appTsx);

let shellTsx = fs.readFileSync('src/components/GlobalNavigationShell.tsx', 'utf8');
if (!shellTsx.includes("id: 'candidate-source-quality-explorer'")) {
  shellTsx = shellTsx.replace(
    "{ id: 'recruiter-handoff-continuity-guard', label: 'Recruiter Handoff Guard' },",
    "{ id: 'candidate-source-quality-explorer', label: 'Source Quality Explorer' },\n      { id: 'recruiter-handoff-continuity-guard', label: 'Recruiter Handoff Guard' },"
  );
}
fs.writeFileSync('src/components/GlobalNavigationShell.tsx', shellTsx);

console.log("Explorer patched correctly");
