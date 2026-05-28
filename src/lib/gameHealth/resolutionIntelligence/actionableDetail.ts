import { companyByTicker } from "@/data/companies";
import { pillarById, type PillarId } from "@/data/pillars";
import { findQuestDefinition } from "@/data/quests/library";

/** Where in the product the flagged copy lives. */
export type AuditContentLocation = {
  companyTicker?: string | null;
  companyName?: string | null;
  pillarId?: string | null;
  pillarLabel?: string | null;
  questSlug?: string | null;
  questTitle?: string | null;
  cardId?: string | null;
  /** Display label e.g. "Card 2" */
  cardLabel?: string | null;
  contentKind?: string | null;
};

export type AuditFlaggedFinding = {
  code: string;
  categoryId?: string;
  categoryLabel?: string;
  reason: string;
  flaggedText: string;
  rewriteDirection: string;
  severity?: string;
};

export type AuditPreferredFix = "regenerate" | "manual_rewrite" | "review_only" | "deploy_fix";

export type AuditActionableDetail = {
  version: 1;
  location: AuditContentLocation;
  findings: AuditFlaggedFinding[];
  preferredFix: AuditPreferredFix;
  preferredFixLabel: string;
};

export const ACTIONABLE_DETAIL_METADATA_KEY = "actionableDetail" as const;

const PILLAR_LABELS: Record<string, string> = {
  business: "Business",
  financials: "Financials",
  management: "Management",
  forces: "Forces"
};

export function pillarLabelFromId(pillarId: string | null | undefined): string | null {
  if (!pillarId) return null;
  if (pillarId in PILLAR_LABELS) return PILLAR_LABELS[pillarId];
  try {
    return pillarById(pillarId as PillarId).title;
  } catch {
    return pillarId;
  }
}

export function cardLabelFromId(cardId: string | null | undefined): string | null {
  if (!cardId) return null;
  const m = /^card-(\d+)$/i.exec(cardId);
  if (m) return `Card ${m[1]}`;
  if (cardId === "forces-topic") return "Forces topic card";
  return cardId;
}

export function questTitleFromSlug(
  companyId: string | undefined,
  pillarId: string | undefined,
  questSlug: string | undefined
): string | null {
  if (!companyId || !pillarId || !questSlug) return null;
  try {
    return findQuestDefinition(companyId as Parameters<typeof findQuestDefinition>[0], pillarId as PillarId, questSlug)?.title ?? null;
  } catch {
    return null;
  }
}

export function formatQuestSectionLabel(questSlug: string | null | undefined, questTitle?: string | null): string {
  if (questTitle?.trim()) return questTitle.trim();
  if (!questSlug) return "—";
  return questSlug
    .split(/[-_]/g)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Pull the sentence (or snippet) that triggered a warning. */
export function extractFlaggedSentence(fullText: string, snippet?: string): string {
  const text = fullText.trim();
  if (!text) return snippet?.trim() ?? "—";

  const snip = snippet?.trim();
  if (!snip) {
    const first = text.split(/(?<=[.!?])\s+/)[0];
    return first?.slice(0, 220) ?? text.slice(0, 220);
  }

  const idx = text.toLowerCase().indexOf(snip.toLowerCase());
  if (idx < 0) return snip.slice(0, 220);

  const before = text.slice(0, idx);
  const afterStart = idx;
  const sentenceStart = Math.max(
    before.lastIndexOf(". ") + 2,
    before.lastIndexOf("! ") + 2,
    before.lastIndexOf("? ") + 2,
    0
  );
  const rest = text.slice(afterStart);
  const endMatch = rest.search(/[.!?](\s|$)/);
  const sentenceEnd =
    endMatch >= 0 ? afterStart + endMatch + 1 : Math.min(text.length, afterStart + 220);

  return text.slice(sentenceStart, sentenceEnd).trim() || snip.slice(0, 220);
}

export function buildContentLocation(input: {
  ticker?: string | null;
  companyName?: string | null;
  pillarId?: string | null;
  questSlug?: string | null;
  questTitle?: string | null;
  cardId?: string | null;
  contentKind?: string | null;
}): AuditContentLocation {
  const company = input.ticker ? companyByTicker(input.ticker) : undefined;
  const pillarLabel = pillarLabelFromId(input.pillarId ?? null);
  const questTitle =
    input.questTitle ??
    (company
      ? questTitleFromSlug(company.id, input.pillarId ?? undefined, input.questSlug ?? undefined)
      : null);

  return {
    companyTicker: input.ticker ?? null,
    companyName: input.companyName ?? company?.name ?? input.ticker ?? null,
    pillarId: input.pillarId ?? null,
    pillarLabel,
    questSlug: input.questSlug ?? null,
    questTitle,
    cardId: input.cardId ?? null,
    cardLabel: cardLabelFromId(input.cardId ?? null),
    contentKind: input.contentKind ?? null
  };
}

export function preferredFixLabel(fix: AuditPreferredFix): string {
  switch (fix) {
    case "regenerate":
      return "Regenerate this card (AI rewrite)";
    case "manual_rewrite":
      return "Manual rewrite in Prompt Studio / editor";
    case "deploy_fix":
      return "Deploy app or content config fix";
    case "review_only":
    default:
      return "Review in admin, then mark resolved";
  }
}

export function readActionableDetail(
  metadata: Record<string, unknown> | undefined | null
): AuditActionableDetail | null {
  if (!metadata) return null;
  const raw = metadata[ACTIONABLE_DETAIL_METADATA_KEY];
  if (!raw || typeof raw !== "object") return null;
  const d = raw as AuditActionableDetail;
  if (d.version !== 1 || !d.location || !Array.isArray(d.findings)) return null;
  return d;
}

export function actionableCardKey(detail: AuditActionableDetail): string {
  const loc = detail.location;
  return [loc.companyTicker, loc.pillarId, loc.questSlug, loc.cardId]
    .filter(Boolean)
    .join(":");
}

export function questPlayPath(detail: AuditActionableDetail): string | null {
  const loc = detail.location;
  if (!loc.questSlug) return null;
  const pillar = loc.pillarId ?? "business";
  if (pillar === "business") return `/business/${loc.questSlug}`;
  return `/${pillar}/${loc.questSlug}`;
}

export function questRegenerateAdminPath(detail: AuditActionableDetail): string {
  const loc = detail.location;
  const params = new URLSearchParams();
  if (loc.companyTicker) params.set("ticker", loc.companyTicker);
  if (loc.pillarId) params.set("pillar", loc.pillarId);
  if (loc.questSlug) params.set("slug", loc.questSlug);
  if (loc.cardId) params.set("cardId", loc.cardId);
  const q = params.toString();
  return q ? `/admin/quest-generation?${q}` : "/admin/quest-generation";
}

export function detectedSummaryFromDetail(detail: AuditActionableDetail): string {
  const loc = detail.location;
  const head = [
    loc.companyTicker,
    loc.pillarLabel,
    formatQuestSectionLabel(loc.questSlug, loc.questTitle),
    loc.cardLabel
  ]
    .filter(Boolean)
    .join(" · ");

  const first = detail.findings[0];
  if (!first) return head || "Content flagged by audit";

  return head ? `${head}: ${first.reason}` : first.reason;
}
