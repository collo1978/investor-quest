import type { CommunicationQualityReport } from "@/lib/communicationQuality/types";
import type { GameHealthIssueRecord } from "@/lib/gameHealth/types";

export type RepairQueueAction =
  | "regenerate_placeholders"
  | "regenerate_technical"
  | "verify_domains"
  | "demo_refresh";

export type RepairQueueItem = {
  id: string;
  status: "action_needed" | "done";
  severity: "critical" | "high" | "medium";
  title: string;
  summary: string;
  actionLabel: string;
  batchAction: RepairQueueAction;
  cardCount: number;
  /** Optional scope for grouped placeholder fixes */
  scope?: { ticker?: string; pillarId?: string };
};

export type RepairQueueDoneItem = {
  id: string;
  title: string;
  fixedAt: string;
};

const LEARNING_CATS = new Set([
  "jargon_detection",
  "beginner_friendliness",
  "cognitive_load",
  "conversational_tone",
  "question_alignment"
]);

const PILLAR_LABELS: Record<string, string> = {
  business: "Business",
  financials: "Financials",
  management: "Management",
  forces: "Forces"
};

function pillarLabel(pillarId: string | undefined): string {
  if (!pillarId) return "Quest";
  return PILLAR_LABELS[pillarId] ?? pillarId;
}

function placeholderGroups(report: CommunicationQualityReport) {
  const groups = new Map<
    string,
    { ticker: string; pillarId: string; count: number }
  >();

  for (const audit of report.weakContent) {
    if (!audit.placeholder || !audit.ticker || !audit.pillarId) continue;
    const key = `${audit.ticker}:${audit.pillarId}`;
    const g = groups.get(key) ?? {
      ticker: audit.ticker,
      pillarId: String(audit.pillarId),
      count: 0
    };
    g.count += 1;
    groups.set(key, g);
  }

  for (const target of report.cardsNeedingRegeneration) {
    const isPlaceholder = target.findings.some((f) => f.code === "template_fallback");
    if (!isPlaceholder) continue;
    const key = `${target.ticker}:${target.pillarId}`;
    const g = groups.get(key) ?? {
      ticker: target.ticker,
      pillarId: target.pillarId,
      count: 0
    };
    g.count += 1;
    groups.set(key, g);
  }

  return [...groups.values()].sort((a, b) => b.count - a.count);
}

function technicalCardCount(report: CommunicationQualityReport): number {
  const keys = new Set<string>();
  for (const target of report.cardsNeedingRegeneration) {
    const technical = target.findings.some(
      (f) => f.categoryId != null && LEARNING_CATS.has(f.categoryId)
    );
    if (technical) {
      keys.add(`${target.ticker}:${target.pillarId}:${target.questSlug}:${target.cardId}`);
    }
  }
  if (keys.size > 0) return keys.size;

  for (const audit of report.weakContent) {
    if (audit.placeholder) continue;
    const technical = audit.warnings.some((w) => LEARNING_CATS.has(w.categoryId));
    if (technical && audit.ticker && audit.questSlug && audit.cardId) {
      keys.add(`${audit.ticker}:${audit.pillarId}:${audit.questSlug}:${audit.cardId}`);
    }
  }
  return keys.size;
}

function nonCommIssueItems(issues: GameHealthIssueRecord[]): RepairQueueItem[] {
  return issues
    .filter((issue) => {
      const domain = issue.metadata?.detectionDomainId ?? issue.metadata?.auditCategory;
      return domain !== "communication_quality" && domain !== "learning_quality";
    })
    .slice(0, 5)
    .map((issue) => ({
      id: `issue:${issue.id}`,
      status: "action_needed" as const,
      severity:
        issue.severity === "critical"
          ? ("critical" as const)
          : issue.severity === "warning"
            ? ("high" as const)
            : ("medium" as const),
      title: issue.title,
      summary: issue.problemPlain,
      actionLabel: "Open fix details",
      batchAction: "verify_domains" as RepairQueueAction,
      cardCount: 1
    }));
}

/** Operator-facing prioritized repair list — no audit internals. */
export function buildRepairQueue(input: {
  report: CommunicationQualityReport | null | undefined;
  openIssues: GameHealthIssueRecord[];
  doneItems?: RepairQueueDoneItem[];
}): { todo: RepairQueueItem[]; done: RepairQueueDoneItem[] } {
  const todo: RepairQueueItem[] = [];
  const report = input.report;

  if (report) {
    for (const group of placeholderGroups(report)) {
      const label = pillarLabel(group.pillarId);
      todo.push({
        id: `ph:${group.ticker}:${group.pillarId}`,
        status: "action_needed",
        severity: "critical",
        title: `${group.ticker} ${label} cards still placeholders`,
        summary: `${group.count} card${group.count === 1 ? "" : "s"} need real copy before demo.`,
        actionLabel: `Regenerate ${group.count} card${group.count === 1 ? "" : "s"}`,
        batchAction: "regenerate_placeholders",
        cardCount: group.count,
        scope: { ticker: group.ticker, pillarId: group.pillarId }
      });
    }

    const techCount = technicalCardCount(report);
    if (techCount > 0) {
      todo.push({
        id: "technical:all",
        status: "action_needed",
        severity: "high",
        title: `${techCount} card${techCount === 1 ? "" : "s"} sound too technical`,
        summary: "Plain-language rewrites for beginner investors.",
        actionLabel: `Rewrite ${techCount} flagged card${techCount === 1 ? "" : "s"}`,
        batchAction: "regenerate_technical",
        cardCount: techCount
      });
    }

    const otherRegen = report.cardsNeedingRegeneration.filter(
      (t) =>
        !t.findings.some((f) => f.code === "template_fallback") &&
        !t.findings.some((f) => f.categoryId && LEARNING_CATS.has(f.categoryId))
    );
    if (otherRegen.length > 0 && techCount === 0) {
      todo.push({
        id: "regen:other",
        status: "action_needed",
        severity: "medium",
        title: `${otherRegen.length} card${otherRegen.length === 1 ? "" : "s"} need copy polish`,
        summary: "Tone or clarity flags outside plain-language category.",
        actionLabel: `Regenerate ${otherRegen.length} card${otherRegen.length === 1 ? "" : "s"}`,
        batchAction: "regenerate_technical",
        cardCount: otherRegen.length
      });
    }
  }

  todo.push(...nonCommIssueItems(input.openIssues));

  const severityOrder = { critical: 0, high: 1, medium: 2 };
  todo.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return { todo, done: input.doneItems ?? [] };
}

export function compactDomainScores(
  report: import("@/lib/gameHealth/types").PlatformHealthReport | null | undefined
): Array<{ label: string; score: number; domainId: string }> {
  if (!report) return [];
  return report.domains
    .filter((d) =>
      ["learning_quality", "communication_quality", "content_completeness"].includes(
        d.domainId
      )
    )
    .map((d) => ({ label: d.label, score: d.score, domainId: d.domainId }));
}
