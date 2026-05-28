import type { BehaviorStoryReport, ClientReportSlice } from "@/platform/gamification/behavioralDesign/analytics/types";
import type { BehavioralDesignAuditReport } from "@/platform/gamification/behavioralDesign/types";

export function buildClientReportSlices(
  audit: BehavioralDesignAuditReport,
  behaviorStory: BehaviorStoryReport
): ClientReportSlice[] {
  const { summary } = behaviorStory;

  return [
    {
      audience: "school",
      title: "For schools & classrooms",
      summary:
        behaviorStory.summary.oneLine +
        " " +
        (summary.whatsWorking.find((w) => w.id === "learning")?.description.split(".")[0] ??
          "Quest flow supports structured literacy.") +
        ".",
      highlights: [
        summary.whatsWorking[0]?.label ?? "Clear progression",
        summary.needsAttention.find((n) => n.visual === "social")?.label ??
          "Community features still light",
        summary.biggestOpportunity.title
      ],
      recommendedActions: [
        "Pilot optional class milestones (privacy-first)",
        "Share Behavior Story Summary in term reviews",
        "Use guided mode before assigning financials units"
      ]
    },
    {
      audience: "broker",
      title: "For brokers & client engagement",
      summary:
        summary.whatsWorking.find((w) => w.id === "progress")?.description ??
        "Clients enjoy visible progress through quests and exploration.",
      highlights: [
        summary.whatsWorking[0]?.label ?? "Strong progress feeling",
        summary.needsAttention[0]?.label ?? "Watch late-journey drop-off",
        summary.biggestOpportunity.actionHint
      ],
      recommendedActions: [
        "Co-brand journey copy with broker identity",
        "Track return visits after first pillar",
        "Lead with guided financials for new retail learners"
      ]
    },
    {
      audience: "bank",
      title: "For banks & regulated programs",
      summary:
        (summary.needsAttention.find((n) => n.visual === "trust")?.description ??
          "Progress mechanics are strong; keep pressure cues (streak loss, heavy gating) secondary to transparent mastery.") +
        " " +
        summary.biggestOpportunity.description,
      highlights: [
        summary.whatsWorking.find((w) => w.visual === "learning")?.label ?? "Approachable learning",
        summary.needsAttention.find((n) => n.visual === "friction")?.label ??
          "Watch financials difficulty",
        summary.biggestOpportunity.title
      ],
      recommendedActions: [
        "Review streak and loss messaging before mass rollout",
        "Export Behavior Story Summary for compliance packs",
        "Offer guided paths for novice segments"
      ]
    },
    {
      audience: "program",
      title: "For education programs & sponsors",
      summary: behaviorStory.summary.oneLine,
      highlights: [
        summary.whatsWorking.map((w) => w.label).join(" · "),
        summary.needsAttention.map((n) => n.label).join(" · "),
        summary.biggestOpportunity.title
      ],
      recommendedActions: [
        "Quarterly Behavior Story Summary in sponsor reports",
        "Connect live analytics when cohort pipeline is ready",
        summary.biggestOpportunity.actionHint
      ]
    },
    {
      audience: "internal",
      title: "For product & ops",
      summary: behaviorStory.executiveSummary,
      highlights: [
        ...summary.whatsWorking.map((w) => `✓ ${w.label}`),
        ...summary.needsAttention.map((n) => `△ ${n.label}`)
      ],
      recommendedActions: [
        summary.biggestOpportunity.actionHint,
        ...audit.hook.suggestions.slice(0, 1),
        ...audit.fogg.suggestions.slice(0, 1)
      ]
    }
  ];
}
