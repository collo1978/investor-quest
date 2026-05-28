import type { PillarId } from "@/data/pillars";
import { CONTROLLED_DEMO_MODE } from "@/lib/demo/controlledDemo";
import { NVDA_PIPELINE_LINES } from "@/lib/demo/nvidiaDemoVoice";

/** How long each generating-phase line stays visible before cycling. */
export const PIPELINE_STATUS_CYCLE_MS = 2800;

const PILLAR_LINES: Record<PillarId, readonly string[]> = {
  business: [
    "Reading SEC filings…",
    "Finding where this shows up in everyday life…",
    "Translating the business into plain English…",
    "Checking what problem it solves for people…",
    "Almost ready — smart-friend answers incoming…"
  ],
  forces: [
    "Reading SEC filings…",
    "Spotting what could help or hurt in real life…",
    "Separating inside strengths from outside risks…",
    "Turning risk factors into plain language…",
    "Packaging your forces field report…"
  ],
  financials: [
    "Reading SEC filings…",
    "Turning big numbers into something you can feel…",
    "Following where the money actually goes…",
    "Checking if profits and cash match the story…",
    "Connecting dollars to why investors care…"
  ],
  management: [
    "Reading proxy statements…",
    "Checking if leaders are aligned with shareholders…",
    "Translating pay and governance into plain trust signals…",
    "Sizing up who is really in control…",
    "Summarizing leadership in everyday terms…"
  ]
};

const QUEST_OVERRIDES: Partial<
  Record<PillarId, Record<string, readonly string[]>>
> = {
  business: {
    revenue: [
      "Reading SEC filings…",
      "Tracing where money shows up in real life…",
      "Mapping products and regions…",
      "Plain-English revenue answers loading…"
    ],
    snapshot: [
      "Reading SEC filings…",
      "Unlocking what this company actually does…",
      "First card loads now — rest follows while you read…"
    ]
  },
  forces: {
    "forces-hub-inside": [
      "Scanning internal forces…",
      "Ranking strengths you can picture…"
    ]
  },
  financials: {
    growth: [
      "Reading SEC filings…",
      "Measuring growth in everyday terms…",
      "Spotting what is speeding up vs slowing down…"
    ],
    cash: [
      "Reading SEC filings…",
      "Following cash like money in your wallet…",
      "Checking whether profits turn into real cash…"
    ]
  },
  management: {
    "mgmt-2": [
      "Reading proxy statements…",
      "Reviewing how leaders get paid…",
      "Connecting pay to behavior you can trust…"
    ]
  }
};

export function getPipelineStatusLines(
  pillarId: PillarId,
  questSlug?: string
): readonly string[] {
  if (CONTROLLED_DEMO_MODE) return NVDA_PIPELINE_LINES;
  const slugLines = questSlug
    ? QUEST_OVERRIDES[pillarId]?.[questSlug]
    : undefined;
  if (slugLines && slugLines.length > 0) return slugLines;
  return PILLAR_LINES[pillarId];
}

export function playerFacingPipelineError(raw: string | null): string {
  if (CONTROLLED_DEMO_MODE) {
    return "One sec — lining up examples you'll actually recognize.";
  }
  if (!raw) return "Could not refresh quest content — tap Try again in a moment.";
  const lower = raw.toLowerCase();
  if (lower.includes("teenager") || lower.includes("jargon") || lower.includes("human-first")) {
    return "Answer was too corporate or technical — regenerating in plain everyday language…";
  }
  if (lower.includes("extract") || lower.includes("filing") || lower.includes("missing")) {
    return "SEC filing sections are not loaded yet. Use Admin → Quest copy to pull filings, then retry.";
  }
  if (lower.includes("openai") || lower.includes("api key")) {
    return "Answer writer is not configured — check OPENAI_API_KEY in .env.local.";
  }
  if (lower.includes("rate") || lower.includes("429") || lower.includes("quota")) {
    return "Filing or answer service is rate-limited — wait a moment, then try again.";
  }
  return "Quest content hit a snag — tap Try again or regenerate from Admin.";
}

export function playerFacingEmptyQuestCopy(pillarId: PillarId): string {
  if (CONTROLLED_DEMO_MODE) {
    return "Almost ready — your card with real-life examples is on the way.";
  }
  switch (pillarId) {
    case "business":
      return "No quest answers yet for this company — generate from Admin or open another quest.";
    case "financials":
      return "Financial quest answers are not loaded yet — run generation when filings are ready.";
    case "forces":
      return "Forces quest answers are not loaded yet — pull fresh risk factors first.";
    case "management":
      return "Management quest answers are not loaded yet — proxy excerpts need a refresh.";
    default:
      return "This quest content is not ready yet — try again shortly.";
  }
}
