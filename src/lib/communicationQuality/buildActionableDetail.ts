import { buildFlaggedFindingsFromWarnings } from "@/lib/communicationQuality/buildFlaggedFindings";
import type {
  CommunicationContentAudit,
  CommunicationRegenerationTarget
} from "@/lib/communicationQuality/types";
import {
  buildContentLocation,
  type AuditActionableDetail
} from "@/lib/gameHealth/resolutionIntelligence/actionableDetail";

/** Client-safe: no Supabase or server-only imports. */
export function buildActionableDetailFromAudit(
  audit: CommunicationContentAudit
): AuditActionableDetail | null {
  if (!audit.ticker || !audit.pillarId || !audit.questSlug) return null;

  const findings = buildFlaggedFindingsFromWarnings(
    audit.warnings,
    audit.bodyText ?? audit.preview,
    5
  );
  const preferredFix: AuditActionableDetail["preferredFix"] =
    audit.placeholder || audit.score < 55 ? "regenerate" : "manual_rewrite";

  return {
    version: 1,
    location: buildContentLocation({
      ticker: audit.ticker,
      companyName: audit.companyName,
      pillarId: String(audit.pillarId),
      questSlug: audit.questSlug,
      cardId: audit.cardId,
      contentKind: audit.kind
    }),
    findings,
    preferredFix,
    preferredFixLabel:
      preferredFix === "regenerate"
        ? "Regenerate this card (AI rewrite)"
        : "Manual rewrite — tighten flagged sentences"
  };
}

export function buildActionableDetailFromTarget(
  target: CommunicationRegenerationTarget
): AuditActionableDetail {
  return {
    version: 1,
    location: buildContentLocation({
      ticker: target.ticker,
      companyName: target.companyName,
      pillarId: target.pillarId,
      questSlug: target.questSlug,
      questTitle: target.questTitle,
      cardId: target.cardId,
      contentKind: "quest_card"
    }),
    findings: target.findings,
    preferredFix: target.preferredFix,
    preferredFixLabel:
      target.preferredFix === "regenerate"
        ? "Regenerate this card (AI rewrite)"
        : "Manual rewrite — edit flagged sentences"
  };
}
