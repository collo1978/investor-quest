import type { CompanyId } from "@/data/companies";
import { findQuestDefinition } from "@/data/quests/library";
import type { PillarId } from "@/data/pillars";
import {
  INVESTOR_QUALITY_CHECKLIST_ITEMS,
  type InvestorQualityChecklistItemId,
  type InvestorQualityChecklistSnapshot
} from "@/lib/business/investorQualityChecklist";
import { parseRelatableQuestAnswer } from "@/lib/quests/questAnswerFormat";

const BUSINESS_PILLAR: PillarId = "business";

function splitIntoSentences(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const matches = trimmed.match(/[^.!?]+[.!?]+/g);
  if (matches?.length) return matches.map((s) => s.trim());
  return [trimmed];
}

function firstEvidenceSentence(
  plainEnglishAnswer: string | null | undefined,
  investorInsight?: string | null
): string | null {
  const relatable = parseRelatableQuestAnswer(plainEnglishAnswer, investorInsight);
  if (relatable?.takeaway?.trim()) return relatable.takeaway.trim();
  if (relatable?.paragraphs.length) {
    const combined = relatable.paragraphs.join(" ");
    const sentences = splitIntoSentences(combined);
    if (sentences[0]) return sentences[0];
  }
  const raw = plainEnglishAnswer?.replace(/\s+/g, " ").trim();
  if (raw) {
    const sentences = splitIntoSentences(raw);
    if (sentences[0]) return sentences[0];
  }
  const insight = investorInsight?.trim();
  if (insight) return insight;
  return null;
}

/** Resolve one short evidence bullet from a stored card slug (`questSlug#card-id`). */
export function resolveEvidenceBulletFromCardSlug(
  companyId: CompanyId,
  cardSlug: string
): string | null {
  const [questSlug, cardId = "card-1"] = cardSlug.split("#");
  if (!questSlug) return null;

  const quest = findQuestDefinition(companyId, BUSINESS_PILLAR, questSlug);
  if (!quest) return null;

  if (quest.cards?.length) {
    const card = quest.cards.find((entry) => entry.id === cardId);
    if (!card) return null;
    return firstEvidenceSentence(card.plainEnglishAnswer, card.investorInsight);
  }

  return firstEvidenceSentence(quest.plainEnglishAnswer, quest.investorInsight);
}

export function resolveChecklistEvidenceBullets(
  companyId: CompanyId,
  snapshot: InvestorQualityChecklistSnapshot,
  itemId: InvestorQualityChecklistItemId
): string[] {
  const slugs = snapshot.evidenceCards?.[itemId] ?? [];
  const bullets: string[] = [];
  for (const slug of slugs) {
    const text = resolveEvidenceBulletFromCardSlug(companyId, slug);
    if (text) bullets.push(text);
  }
  return bullets;
}

export function resolveAllChecklistEvidenceBullets(
  companyId: CompanyId,
  snapshot: InvestorQualityChecklistSnapshot
): Partial<Record<InvestorQualityChecklistItemId, string[]>> {
  const result: Partial<Record<InvestorQualityChecklistItemId, string[]>> = {};
  for (const item of INVESTOR_QUALITY_CHECKLIST_ITEMS) {
    const bullets = resolveChecklistEvidenceBullets(companyId, snapshot, item.id);
    if (bullets.length) result[item.id] = bullets;
  }
  return result;
}
