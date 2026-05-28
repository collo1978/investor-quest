/**
 * Dev-only: ensure controlled NVIDIA demo quests resolve learning-design rules.
 */
import { resolveContentRules } from "@/data/contentRules/resolveContentRules";
import type { PillarId } from "@/data/pillars";

/** Mirrors controlled demo slugs — kept local to avoid import cycles with `controlledDemo.ts`. */
const DEMO_RULE_CHECK: ReadonlyArray<{
  pillarId: PillarId;
  slugs: readonly string[];
}> = [
  {
    pillarId: "business",
    slugs: [
      "what-they-do",
      "why-buying",
      "everyday-life",
      "how-it-works",
      "why-they-stay",
      "competition"
    ]
  },
  { pillarId: "financials", slugs: ["growth"] },
  {
    pillarId: "forces",
    slugs: ["forces-hub-positive-inside", "positive-inside-supply-chain"]
  },
  { pillarId: "management", slugs: ["mgmt-1"] }
];

export function validateNvidiaDemoContentRulesCoverage(): void {
  const missing: string[] = [];

  for (const { pillarId, slugs } of DEMO_RULE_CHECK) {
    for (const slug of slugs) {
      const resolved = resolveContentRules({ pillarId, questSlug: slug });
      if (!resolved) {
        missing.push(`${pillarId}:${slug}`);
      }
    }
  }

  if (missing.length > 0) {
    console.warn(
      "[investorQuestContentRules] Missing rule mapping for demo slugs:",
      missing.join(", ")
    );
  }
}

