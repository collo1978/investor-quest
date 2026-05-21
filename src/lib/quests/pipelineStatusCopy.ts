import type { PillarId } from "@/data/pillars";

/** How long each generating-phase line stays visible before cycling. */
export const PIPELINE_STATUS_CYCLE_MS = 2800;

const PILLAR_LINES: Record<PillarId, readonly string[]> = {
  business: [
    "Reading SEC filings…",
    "Mapping how the company makes money…",
    "Tracing revenue segments and customers…",
    "Unpacking operations and competitive edge…",
    "Translating management narrative into investor language…"
  ],
  forces: [
    "Reading SEC filings…",
    "Analyzing company risks in Item 1A…",
    "Mapping competitive forces around the business…",
    "Separating tailwinds from headwinds…",
    "Building your forces field report…"
  ],
  financials: [
    "Reading SEC filings…",
    "Tracing revenue and margin drivers…",
    "Stress-testing cash generation…",
    "Reviewing balance-sheet strength…",
    "Connecting numbers to investment conviction…"
  ],
  management: [
    "Reading proxy statements…",
    "Reviewing management incentives…",
    "Checking governance and alignment…",
    "Sizing up capital stewardship…",
    "Summarizing leadership signals for investors…"
  ]
};

const QUEST_OVERRIDES: Partial<
  Record<PillarId, Record<string, readonly string[]>>
> = {
  business: {
    revenue: [
      "Reading SEC filings…",
      "Mapping revenue segments…",
      "Sizing geographic mix…",
      "Linking product lines to dollars…"
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
      "Ranking strengths inside the business…"
    ]
  },
  financials: {
    growth: [
      "Reading SEC filings…",
      "Measuring growth pace and mix…",
      "Spotting what is accelerating vs fading…"
    ],
    cash: [
      "Reading SEC filings…",
      "Following cash from operations…",
      "Checking whether profits convert to cash…"
    ]
  },
  management: {
    "mgmt-2": [
      "Reading proxy statements…",
      "Reviewing management incentives…",
      "Connecting pay to performance…"
    ]
  }
};

export function getPipelineStatusLines(
  pillarId: PillarId,
  questSlug?: string
): readonly string[] {
  const slugLines = questSlug
    ? QUEST_OVERRIDES[pillarId]?.[questSlug]
    : undefined;
  if (slugLines && slugLines.length > 0) return slugLines;
  return PILLAR_LINES[pillarId];
}

export function playerFacingPipelineError(raw: string | null): string {
  if (!raw) return "Intel refresh hit a snag — try again in a moment.";
  const lower = raw.toLowerCase();
  if (lower.includes("extract") || lower.includes("filing")) {
    return "We could not reach the latest filing yet. Tap retry to pull fresh SEC intel.";
  }
  if (lower.includes("openai") || lower.includes("api key")) {
    return "Research engine is warming up — retry shortly.";
  }
  if (lower.includes("rate") || lower.includes("429")) {
    return "High demand on the research line — give it a few seconds, then retry.";
  }
  return "Intel refresh hit a snag — tap retry to run the pipeline again.";
}
