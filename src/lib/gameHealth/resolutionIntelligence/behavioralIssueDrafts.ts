import { DEFAULT_BEHAVIORAL_AUDIT_SCORES } from "@/platform/gamification/behavioralDesign/defaultScores";
import { evaluateBehavioralDesign } from "@/platform/gamification/behavioralDesign/evaluateBehavioralDesign";
import type {
  BehavioralAuditWarning,
  BehavioralDesignAuditReport,
  FoggFrameworkResult,
  HookFrameworkResult,
  OctalysisFrameworkResult,
  SdtFrameworkResult
} from "@/platform/gamification/behavioralDesign/types";
import type { GameHealthIssueRecord } from "@/lib/gameHealth/types";

import { enrichIssueDraft } from "./enrichIssue";

const BEHAVIORAL_THRESHOLD = 60;

type FrameworkSlice = {
  frameworkId: string;
  label: string;
  overallPercent: number;
  warnings: BehavioralAuditWarning[];
  suggestions: string[];
};

function frameworkSlices(report: BehavioralDesignAuditReport): FrameworkSlice[] {
  const map = (
    fw:
      | OctalysisFrameworkResult
      | HookFrameworkResult
      | SdtFrameworkResult
      | FoggFrameworkResult
  ): FrameworkSlice => ({
    frameworkId: fw.frameworkId,
    label: fw.label,
    overallPercent: fw.healthPercent,
    warnings: fw.warnings,
    suggestions: fw.suggestions
  });

  return [report.octalysis, report.hook, report.sdt, report.fogg].map(map);
}

export function behavioralIssueDraftsFromScores(
  scores = DEFAULT_BEHAVIORAL_AUDIT_SCORES
): Omit<
  GameHealthIssueRecord,
  "id" | "checkId" | "createdAt" | "updatedAt" | "status"
>[] {
  const report = evaluateBehavioralDesign(scores);
  const drafts: Omit<
    GameHealthIssueRecord,
    "id" | "checkId" | "createdAt" | "updatedAt" | "status"
  >[] = [];

  for (const fw of frameworkSlices(report)) {
    if (fw.overallPercent >= BEHAVIORAL_THRESHOLD) continue;

    const topWarning = fw.warnings[0];
    const topSuggestion = fw.suggestions[0];

    drafts.push(
      enrichIssueDraft({
        issueKey: `behavioral:${fw.frameworkId}`,
        severity: fw.overallPercent < 45 ? "critical" : "warning",
        title: `${fw.label} — behavioral design`,
        problemPlain:
          topWarning?.message ??
          `${fw.label} scored ${fw.overallPercent}% — below the ${BEHAVIORAL_THRESHOLD}% review threshold.`,
        whatUsersSee:
          "Players may feel less curious, less competent, or less motivated to return after finishing a pillar.",
        suggestedFix:
          topSuggestion ??
          "Review behavioral design scores in Gamification admin and rebalance motivation loops.",
        fixAction: "mark_resolved",
        companyTicker: null,
        companyName: null,
        pillarId: null,
        questSlug: null,
        cardId: null,
        metadata: {
          auditCategory: "behavioral_design",
          frameworkId: fw.frameworkId,
          frameworkScore: fw.overallPercent,
          whyItMatters:
            fw.frameworkId === "octalysis"
              ? "Over-reliance on XP rewards weakens intrinsic motivation compared to competence and identity reinforcement."
              : fw.frameworkId === "hook"
                ? "Weak curiosity loops reduce return motivation after players complete a pillar like Financials."
                : "Behavioral design gaps reduce long-term engagement with the research RPG.",
          warnings: fw.warnings.map((w) => w.message),
          suggestions: fw.suggestions
        }
      })
    );
  }

  const allWarnings = frameworkSlices(report).flatMap((f) =>
    f.warnings.map((w) => ({ ...w, frameworkId: f.frameworkId }))
  );

  for (const w of allWarnings.slice(0, 5)) {
    if (drafts.some((d) => d.problemPlain.includes(w.message.slice(0, 40)))) continue;

    drafts.push(
      enrichIssueDraft({
        issueKey: `behavioral:warning:${w.id}`,
        severity: w.severity === "critical" ? "critical" : "warning",
        title: `Behavioral design — ${w.id.replace(/_/g, " ")}`,
        problemPlain: w.message,
        whatUsersSee: "Engagement mechanics may feel grindy or pressuring instead of mastery-building.",
        suggestedFix:
          report.octalysis.suggestions[0] ??
          "Rebalance gamification toward competence, autonomy, and investor identity.",
        fixAction: "mark_resolved",
        companyTicker: null,
        companyName: null,
        pillarId: null,
        questSlug: null,
        cardId: null,
        metadata: {
          auditCategory: "behavioral_design",
          warningId: w.id,
          frameworkId: w.frameworkId,
          whyItMatters:
            "Intrinsic motivation weaker than extrinsic XP celebration reduces sustained research habit."
        }
      })
    );
  }

  return drafts.slice(0, 8);
}

/** Gamification mechanic gaps from low behavioral signals. */
export function gamificationIssueDraftsFromBehavioral(
  behavioralDrafts: ReturnType<typeof behavioralIssueDraftsFromScores>
): Omit<
  GameHealthIssueRecord,
  "id" | "checkId" | "createdAt" | "updatedAt" | "status"
>[] {
  const xpDominant = behavioralDrafts.find((d) =>
    String(d.metadata?.warningId ?? "").includes("xp_dominant")
  );
  if (!xpDominant) return [];

  return [
    enrichIssueDraft({
      issueKey: "gamification:xp_over_reliance",
      severity: "warning",
      title: "Gamification — over-reliance on XP rewards",
      problemPlain: "XP and accomplishment drives may dominate over competence and identity.",
      whatUsersSee: "Players see level-ups but may not feel like stronger investors.",
      suggestedFix:
        "Increase competence/identity reinforcement on quest completion and profile surfaces.",
      fixAction: "mark_resolved",
      companyTicker: null,
      companyName: null,
      pillarId: null,
      questSlug: null,
      cardId: null,
      metadata: {
        auditCategory: "gamification_mechanics",
        whyItMatters:
          "Intrinsic motivation weaker than extrinsic XP reduces long-term return rate."
      }
    })
  ];
}
