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

const BOARD_IDS = {
  main: "278627d8-606a-4935-bd8f-9293ffcfabc7", // autonomous-mission-control
  bob: "24a91d03-2211-4376-92d6-7e2f7251e51a", // job-hunter-os-v2
} as const;

export const ORG_TREE: OrgTreeNode = {
  id: "main",
  name: "OPI",
  role: "CEO & Mission Control",
  responsibility: "Prioritizes work, unblocks progress, and owns end-of-day direction",
  model: "gpt-5.3-codex",
  tier: "root",
  emoji: "👑",
  boardId: BOARD_IDS.main,
  children: [
    {
      id: "bob",
      name: "BOB",
      role: "Builder & Developer",
      responsibility: "Implements the single highest-value task and reports verified output",
      model: "gpt-5.3-codex",
      tier: "sub",
      emoji: "💻",
      parentId: "main",
      boardId: BOARD_IDS.bob,
    },
  ],
};

export const SWARM_LINKS: SwarmLink[] = [
  { from: "main", to: "bob", label: "Priority -> Build" },
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
