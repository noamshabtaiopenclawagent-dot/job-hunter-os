export type AgentTier = "root" | "sub" | "supporting" | "system";

export type SwarmLink = {
  from: string; // agent id
  to: string;   // agent id
  label: string;
};

export type OrgTreeNode = {
  id: string;
  name: string;
  role: string;
  responsibility: string;
  model: string;
  tier: AgentTier;
  boardId?: string;
  emoji: string;
  parentId?: string;
  children?: OrgTreeNode[];
};

// Real board IDs from the Mission Control API
const BOARD_IDS = {
  alex:  "278627d8-606a-4935-bd8f-9293ffcfabc7", // autonomous-mission-control
  bob:   "24a91d03-2211-4376-92d6-7e2f7251e51a", // job-hunter-os-v2
  infra: "a9a74814-6693-438c-a7b2-b439d3eaa24f", // infra-devops
  mc:    "4ec8efd0-17c5-4c3d-91b8-dcff44ba021f", // mc-platform
} as const;

export const ORG_TREE: OrgTreeNode = {
  id: "main",
  name: "OPI",
  role: "CEO & Dispatcher",
  responsibility: "Routes tasks, coordinates agents, never executes code directly",
  model: "gpt-5.3-codex",
  tier: "root",
  emoji: "👑",
  boardId: BOARD_IDS.mc,
  children: [
    {
      id: "bob",
      name: "BOB",
      role: "Dev Executor",
      responsibility: "Full-stack developer — writes, edits, and ships code",
      model: "gpt-5.3-codex",
      tier: "sub",
      emoji: "💻",
      parentId: "main",
      boardId: BOARD_IDS.bob,
    },
    {
      id: "alex",
      name: "ALEX",
      role: "QA Lead",
      responsibility: "Reviews BOB\u2019s code, runs tests, delivers PASS/FAIL verdicts",
      model: "kimi-k2.5",
      tier: "sub",
      emoji: "🔬",
      parentId: "main",
      boardId: BOARD_IDS.alex,
    },
    {
      id: "dash",
      name: "DASH",
      role: "Dashboard PM",
      responsibility: "Monitors project dashboards, reports progress, escalates blockers",
      model: "kimi-k2.5",
      tier: "supporting",
      emoji: "📊",
      parentId: "main",
      boardId: BOARD_IDS.mc,
    },
    {
      id: "mico",
      name: "MICO",
      role: "MC Ops",
      responsibility: "Manages Mission Control boards, tasks, and lifecycle events",
      model: "kimi-k2.5",
      tier: "supporting",
      emoji: "🎯",
      parentId: "main",
      boardId: BOARD_IDS.mc,
    },
    {
      id: "rex",
      name: "REX",
      role: "Research & RAG",
      responsibility: "Web research, knowledge retrieval, weekly intelligence briefs",
      model: "kimi-k2.5",
      tier: "supporting",
      emoji: "🔍",
      parentId: "main",
      boardId: BOARD_IDS.mc,
    },
    {
      id: "cronx",
      name: "CRONX",
      role: "Cron Ops",
      responsibility: "Watches scheduled jobs, detects failures, verifies cron health",
      model: "kimi-k2.5",
      tier: "system",
      emoji: "⏰",
      parentId: "main",
      boardId: BOARD_IDS.infra,
    },
    {
      id: "sentry",
      name: "SENTRY",
      role: "Security",
      responsibility: "Secret scanning, vulnerability detection, CISO protocol enforcement",
      model: "kimi-k2.5",
      tier: "system",
      emoji: "🛡️",
      parentId: "main",
      boardId: BOARD_IDS.infra,
    },
  ],
};

/** Swarm delegation edges — shown as animated arrows in the virtual office */
export const SWARM_LINKS: SwarmLink[] = [
  { from: "bob",  to: "alex", label: "Code Review" },
  { from: "main", to: "bob",  label: "Dev Tasks" },
  { from: "main", to: "alex", label: "QA Oversight" },
];

/** Flat list of all agent IDs in the tree for lookup */
export const ALL_AGENT_IDS: string[] = [
  ORG_TREE.id,
  ...(ORG_TREE.children?.map((c) => c.id) ?? []),
];

/** Flat array of all nodes for lookup */
export function flattenTree(node: OrgTreeNode): OrgTreeNode[] {
  return [node, ...(node.children?.flatMap(flattenTree) ?? [])];
}
