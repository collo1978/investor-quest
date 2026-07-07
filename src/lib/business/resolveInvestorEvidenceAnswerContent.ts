import type { BusinessInvestorEvidenceCardDef } from "@/lib/business/businessInvestorEvidenceCards";
import { splitIntoSentences } from "@/lib/quests/scannableAnswer";

/** Fixed A-section shape for every investor evidence card. */
export type InvestorEvidenceAnswerContent = {
  headline: string;
  body: string;
  bullets?: readonly string[];
  callout?: string;
};

export function resolveInvestorEvidenceAnswerContent(
  card: BusinessInvestorEvidenceCardDef
): InvestorEvidenceAnswerContent {
  if (card.answerHeadline?.trim()) {
    return {
      headline: card.answerHeadline.trim(),
      body: card.answerBody?.trim() ?? "",
      bullets: card.bullets,
      callout: card.callout
    };
  }

  const normalized = card.answer.replace(/\s+/g, " ").trim();
  const sentences = splitIntoSentences(normalized);
  return {
    headline: sentences[0] ?? normalized,
    body: sentences.slice(1).join(" ").trim()
  };
}
