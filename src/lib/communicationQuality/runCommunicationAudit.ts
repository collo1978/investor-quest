import { companyByTicker } from "@/data/companies";
import { PILLAR_ORDER, type PillarId } from "@/data/pillars";
import { getCompanyPillarQuests } from "@/data/quests/library";
import { auditCommunicationText } from "@/lib/communicationQuality/auditText";
import {
  COMMUNICATION_CATEGORY_DEFS,
  COMMUNICATION_OVERALL_CHECK_ID
} from "@/lib/communicationQuality/categoryLabels";
import type {
  CommunicationCategoryId,
  CommunicationCategoryResult,
  CommunicationContentAudit,
  CommunicationPhraseHit,
  CommunicationQualityReport,
  CommunicationRegenerationTarget,
  CommunicationWarning
} from "@/lib/communicationQuality/types";
import { PLAYABLE_DEMO_TICKERS } from "@/lib/demo/playableDemo";
import { item } from "@/lib/gameHealth/enrichCheck";
import { enrichIssueDraft } from "@/lib/gameHealth/resolutionIntelligence/enrichIssue";
import type { GameHealthIssueRecord, HealthCheckItem } from "@/lib/gameHealth/types";
import { getInvestorMasteryContent } from "@/lib/quests/investorMasteryCopy";
import { resolveQuestCardDisplayContent } from "@/lib/quests/questCardContentSource";
import { FORCES_TOPIC_CARD_ID } from "@/lib/sec/forcesTopicSectionMap";
import { fetchQuestCardAnswersForSlug } from "@/lib/supabase/questCardAnswers/storage";

import {
  buildActionableDetailFromAudit,
  buildActionableDetailFromTarget
} from "@/lib/communicationQuality/buildActionableDetail";
import { buildFlaggedFindingsFromWarnings } from "@/lib/communicationQuality/buildFlaggedFindings";
import {
  buildContentLocation,
  cardLabelFromId,
  pillarLabelFromId,
  questTitleFromSlug,
  type AuditActionableDetail
} from "@/lib/gameHealth/resolutionIntelligence/actionableDetail";

export { buildActionableDetailFromAudit, buildActionableDetailFromTarget } from "@/lib/communicationQuality/buildActionableDetail";

import { scoreToHealthStatus } from "./categoryLabels";

const PILLAR_LABELS: Record<string, string> = {
  business: "Business",
  financials: "Financials",
  management: "Management",
  forces: "Forces"
};

function average(nums: number[]): number {
  if (nums.length === 0) return 100;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function categoryScoreFromAudits(
  audits: CommunicationContentAudit[],
  categoryId: CommunicationCategoryId
): { score: number; audited: number; weak: number; warnings: CommunicationWarning[] } {
  const scorable = audits.filter((a) => !a.placeholder);
  if (scorable.length === 0) {
    return { score: 100, audited: 0, weak: 0, warnings: [] };
  }

  const scores: number[] = [];
  const warnings: CommunicationWarning[] = [];

  for (const audit of scorable) {
    const catWarnings = audit.warnings.filter((w) => w.categoryId === categoryId);
    const catScore =
      catWarnings.length === 0
        ? 100
        : Math.max(0, 100 - catWarnings.length * 12);
    scores.push(catScore);
    warnings.push(...catWarnings);
  }

  const weak = scores.filter((s) => s < 70).length;
  const uniqueWarnings = warnings.slice(0, 12);

  return {
    score: average(scores),
    audited: scorable.length,
    weak,
    warnings: uniqueWarnings
  };
}

function buildCategories(audits: CommunicationContentAudit[]): CommunicationCategoryResult[] {
  return COMMUNICATION_CATEGORY_DEFS.map((def) => {
    const stats = categoryScoreFromAudits(audits, def.id);
    return {
      id: def.id,
      label: def.label,
      description: def.description,
      score: stats.score,
      audited: stats.audited,
      weak: stats.weak,
      sampleWarnings: stats.warnings
    };
  });
}

function buildPillarScores(audits: CommunicationContentAudit[]) {
  return PILLAR_ORDER.map((pillarId) => {
    const pillarAudits = audits.filter(
      (a) => a.pillarId === pillarId && a.kind === "quest_card" && !a.placeholder
    );
    const scores = pillarAudits.map((a) => a.score);
    return {
      pillarId,
      label: PILLAR_LABELS[pillarId] ?? pillarId,
      score: average(scores),
      audited: pillarAudits.length,
      weak: pillarAudits.filter((a) => a.score < 70).length
    };
  });
}

function buildPhraseHits(audits: CommunicationContentAudit[]): CommunicationPhraseHit[] {
  const counts = new Map<string, { count: number; categoryId: CommunicationCategoryId }>();
  for (const audit of audits) {
    for (const w of audit.warnings) {
      const key = w.code;
      const prev = counts.get(key);
      if (prev) prev.count += 1;
      else counts.set(key, { count: 1, categoryId: w.categoryId });
    }
  }
  return [...counts.entries()]
    .map(([phrase, v]) => ({
      phrase,
      count: v.count,
      categoryId: v.categoryId
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

function buildRegenerationTargets(
  audits: CommunicationContentAudit[]
): CommunicationRegenerationTarget[] {
  return audits
    .filter(
      (a) =>
        a.kind === "quest_card" &&
        a.needsRegeneration &&
        a.ticker &&
        a.pillarId &&
        a.questSlug &&
        a.cardId
    )
    .sort((a, b) => a.score - b.score)
    .slice(0, 40)
    .map((a) => {
      const ticker = a.ticker!;
      const pillarId = String(a.pillarId);
      const questSlug = a.questSlug!;
      const cardId = a.cardId!;
      const company = companyByTicker(ticker);
      const findings = buildFlaggedFindingsFromWarnings(
        a.warnings,
        a.bodyText ?? a.preview,
        5
      );
      const preferredFix: "regenerate" | "manual_rewrite" =
        a.placeholder || a.score < 55 ? "regenerate" : "manual_rewrite";

      return {
        ticker,
        companyName: a.companyName ?? company?.name ?? ticker,
        pillarId,
        pillarLabel: pillarLabelFromId(pillarId) ?? pillarId,
        questSlug,
        questTitle:
          questTitleFromSlug(company?.id, pillarId, questSlug) ??
          questSlug,
        cardId,
        cardLabel: cardLabelFromId(cardId) ?? cardId,
        score: a.score,
        source: a.source,
        topWarnings: findings.map((f) => f.reason),
        preview: a.preview,
        findings,
        preferredFix
      };
    });
}

async function auditQuestCardsForCompany(ticker: string): Promise<CommunicationContentAudit[]> {
  const company = companyByTicker(ticker);
  if (!company) return [];

  const results: CommunicationContentAudit[] = [];

  for (const pillarId of PILLAR_ORDER) {
    const quests = getCompanyPillarQuests(company.id, pillarId);

    for (const quest of quests) {
      const generated = await fetchQuestCardAnswersForSlug({
        ticker,
        pillarId,
        questSlug: quest.slug
      });

      const cardEntries =
        quest.cards?.length && quest.cards.length > 0
          ? quest.cards.map((c) => ({
              id: c.id,
              question: c.investorQuestion,
              template: c
            }))
          : [
              {
                id: pillarId === "forces" ? FORCES_TOPIC_CARD_ID : "card-1",
                question: quest.investorQuestion,
                template: null
              }
            ];

      for (const card of cardEntries) {
        const resolved = resolveQuestCardDisplayContent({
          companyId: company.id,
          pillarId,
          questSlug: quest.slug,
          cardId: card.id,
          instantiatedCard: card.template ?? quest,
          generatedCard: generated[card.id] ?? null
        });

        const isPlaceholder =
          resolved.source === "template_fallback" || resolved.source === "generating";
        const text = resolved.plainEnglishAnswer ?? "";

        results.push(
          auditCommunicationText({
            text,
            contentId: `${ticker}:${pillarId}:${quest.slug}:${card.id}`,
            kind: "quest_card",
            ticker,
            companyName: company.name,
            pillarId,
            questSlug: quest.slug,
            cardId: card.id,
            source: resolved.source,
            question: card.question ?? quest.investorQuestion,
            placeholder: isPlaceholder || !text.trim()
          })
        );
      }

      if (quest.quizConfig?.questions) {
        for (const q of quest.quizConfig.questions) {
          const explain = "explain" in q ? (q.explain as string | undefined) : undefined;
          if (!explain?.trim()) continue;
          results.push(
            auditCommunicationText({
              text: explain,
              contentId: `${ticker}:${pillarId}:${quest.slug}:quiz:${q.id}`,
              kind: "quiz_explanation",
              ticker,
              companyName: company.name,
              pillarId,
              questSlug: quest.slug,
              source: "quiz_config"
            })
          );
        }
      }

      const mastery = getInvestorMasteryContent({
        companyName: company.name,
        pillarId,
        questSlug: quest.slug,
        questTitle: quest.title
      });

      const masteryText = [mastery.message, ...mastery.learned].join("\n\n");
      results.push(
        auditCommunicationText({
          text: masteryText,
          contentId: `${ticker}:${pillarId}:${quest.slug}:mastery`,
          kind: "mastery_summary",
          ticker,
          companyName: company.name,
          pillarId,
          questSlug: quest.slug,
          source: "mastery_copy"
        })
      );
    }
  }

  return results;
}

/** Scan all demo companies and aggregate a communication intelligence report. */
export async function runCommunicationQualityAudit(): Promise<CommunicationQualityReport> {
  const allAudits: CommunicationContentAudit[] = [];

  for (const ticker of PLAYABLE_DEMO_TICKERS) {
    const companyAudits = await auditQuestCardsForCompany(ticker);
    allAudits.push(...companyAudits);
  }

  const scorable = allAudits.filter((a) => !a.placeholder);
  const categories = buildCategories(allAudits);
  const overallHealthPercent = average(scorable.map((a) => a.score));

  const weakContent = scorable
    .filter((a) => a.score < 85 || a.warnings.length > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 50);

  return {
    version: 1,
    overallHealthPercent,
    executedAt: new Date().toISOString(),
    companiesAudited: [...PLAYABLE_DEMO_TICKERS],
    contentAudited: allAudits.length,
    contentWeak: scorable.filter((a) => a.score < 70).length,
    placeholderCount: allAudits.filter((a) => a.placeholder).length,
    categories,
    pillarScores: buildPillarScores(allAudits),
    topProblemPhrases: buildPhraseHits(allAudits),
    recurringPatterns: buildPhraseHits(allAudits).map((p) => ({
      pattern: p.phrase,
      count: p.count
    })),
    weakContent,
    cardsNeedingRegeneration: buildRegenerationTargets(allAudits)
  };
}

export function communicationChecksFromReport(
  report: CommunicationQualityReport
): HealthCheckItem[] {
  const checks: HealthCheckItem[] = [];

  for (const cat of report.categories) {
    const def = COMMUNICATION_CATEGORY_DEFS.find((d) => d.id === cat.id);
    if (!def) continue;
    const status = scoreToHealthStatus(cat.score);
    checks.push(
      item(def.checkId, def.label, status, formatCategoryMessage(cat), 5, {
        layman:
          status !== "pass"
            ? `${cat.label} needs attention on ${cat.weak} piece(s) of player copy.`
            : undefined
      })
    );
  }

  const overallStatus = scoreToHealthStatus(report.overallHealthPercent);
  checks.push(
    item(
      COMMUNICATION_OVERALL_CHECK_ID,
      "Communication health (overall)",
      overallStatus,
      `Communication health ${report.overallHealthPercent}% across ${report.contentAudited} player-facing items (${report.placeholderCount} placeholders). ${report.cardsNeedingRegeneration.length} card(s) flagged for regeneration.`,
      10,
      {
        layman:
          overallStatus !== "pass"
            ? "Some quest copy may feel robotic, jargon-heavy, or hard for beginners to follow."
            : "Quest communication reads like a smart friend explaining investing."
      }
    )
  );

  return checks;
}

function formatCategoryMessage(cat: CommunicationCategoryResult): string {
  if (cat.audited === 0) return "No scorable content yet.";
  const top = cat.sampleWarnings[0]?.message;
  return `${cat.score}% — ${cat.weak} weak of ${cat.audited} audited.${top ? ` Example: ${top}` : ""}`;
}

export function communicationIssueDraftsFromReport(
  report: CommunicationQualityReport,
  checkId: string | null
): Omit<
  GameHealthIssueRecord,
  "id" | "checkId" | "createdAt" | "updatedAt" | "status"
>[] {
  const drafts: Omit<
    GameHealthIssueRecord,
    "id" | "checkId" | "createdAt" | "updatedAt" | "status"
  >[] = [];

  for (const target of report.cardsNeedingRegeneration.slice(0, 20)) {
    const actionableDetail = buildActionableDetailFromTarget(target);
    const primary = target.findings[0];
    const fixAction =
      target.preferredFix === "regenerate" ? "retry_generation" : "mark_resolved";

    drafts.push(
      enrichIssueDraft({
        issueKey: `comm:${target.ticker}:${target.pillarId}:${target.questSlug}:${target.cardId}`,
        severity: target.score < 50 ? "critical" : "warning",
        title: `${target.ticker} · ${target.cardLabel} — ${primary?.categoryLabel ?? "Communication"}`,
        problemPlain: primary
          ? `${target.pillarLabel} / ${target.questTitle}: ${primary.reason}`
          : "Communication quality below threshold.",
        whatUsersSee: primary?.flaggedText
          ? `Players may read: "${primary.flaggedText.slice(0, 120)}${primary.flaggedText.length > 120 ? "…" : ""}"`
          : "Quest copy may sound robotic, jargon-heavy, or drift from the question.",
        suggestedFix: primary?.rewriteDirection ?? actionableDetail.preferredFixLabel,
        fixAction,
        companyTicker: target.ticker,
        companyName: target.companyName,
        pillarId: target.pillarId,
        questSlug: target.questSlug,
        cardId: target.cardId,
        metadata: {
          auditCategory: "communication_quality",
          communicationScore: target.score,
          source: target.source,
          actionableDetail,
          communicationCategory: primary?.categoryId
        }
      })
    );
  }

  if (report.placeholderCount > 0 && drafts.length < 25) {
    const placeholderAudits = report.weakContent.filter((a) => a.placeholder).slice(0, 5);
    const findings = placeholderAudits.map((a) => ({
      code: "template_fallback",
      categoryLabel: "Content completeness",
      reason: "No generated copy yet — template placeholder on this card.",
      flaggedText: a.preview || "Empty or placeholder card body",
      rewriteDirection: "Run SEC extract + regenerate this card for the demo company.",
      severity: "critical"
    }));

    drafts.push(
      enrichIssueDraft({
        issueKey: "comm:placeholders",
        severity: "warning",
        title: `${report.placeholderCount} quest cards still use template placeholders`,
        problemPlain:
          findings[0]?.reason ??
          "Empty or template fallback copy is not beginner-friendly communication.",
        whatUsersSee: "Players may see blank or generic placeholder text on quest cards.",
        suggestedFix: "Run SEC extract + demo content refresh for affected companies.",
        fixAction: "clear_and_regenerate",
        companyTicker: placeholderAudits[0]?.ticker ?? null,
        companyName: placeholderAudits[0]?.companyName ?? null,
        pillarId: placeholderAudits[0]?.pillarId ? String(placeholderAudits[0].pillarId) : null,
        questSlug: placeholderAudits[0]?.questSlug ?? null,
        cardId: placeholderAudits[0]?.cardId ?? null,
        metadata: {
          auditCategory: "content_completeness",
          placeholderCount: report.placeholderCount,
          checkId,
          actionableDetail: {
            version: 1,
            location: buildContentLocation({
              ticker: placeholderAudits[0]?.ticker,
              companyName: placeholderAudits[0]?.companyName,
              pillarId: placeholderAudits[0]?.pillarId
                ? String(placeholderAudits[0].pillarId)
                : null,
              questSlug: placeholderAudits[0]?.questSlug,
              cardId: placeholderAudits[0]?.cardId,
              contentKind: "quest_card"
            }),
            findings,
            preferredFix: "regenerate",
            preferredFixLabel: "Regenerate placeholder cards (demo content refresh)"
          }
        }
      })
    );
  }

  return drafts;
}
