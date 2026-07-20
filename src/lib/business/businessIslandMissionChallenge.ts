import {
  formatInvestorNotebookQuestion,
  INVESTOR_NOTEBOOK_QUESTIONS,
  type InvestorNotebookQuestionId
} from "@/lib/business/businessIslandInvestorNotebook";
import type { InvestorChallengeDef } from "@/lib/business/businessInvestorChallengeFlow";
import { resolveHqDecodeEvidence } from "@/lib/business/businessIslandHqDecodeContent";

/**
 * Turn a checklist question into a lenient inline Investor Challenge.
 * Keywords are pulled from the question's evidence terms so any plain-English
 * answer touching the core idea passes (Schools grader is non-punishing).
 */
export function buildNotebookChallengeDef(
  questionId: InvestorNotebookQuestionId,
  companyName: string
): InvestorChallengeDef {
  const question = INVESTOR_NOTEBOOK_QUESTIONS.find((q) => q.id === questionId);
  const rawPrompt = question
    ? formatInvestorNotebookQuestion(question.questionTemplate, companyName)
    : "Explain this in your own words.";
  const prompt = rawPrompt
    .replace(/^Can I explain/i, "Explain")
    .replace(/in my own words\?$/i, "in your own words.");

  const evidence = resolveHqDecodeEvidence(questionId);
  const keywords = Array.from(
    new Set(
      evidence.flatMap((piece) =>
        piece.terms.flatMap((term) => term.recallKeywords)
      )
    )
  );

  return {
    // principleId is unused by the evaluator; cast to satisfy the type.
    principleId: "business-purpose",
    prompt,
    minWords: 3,
    conceptGroups: [{ label: "the key idea", keywords }]
  } as InvestorChallengeDef;
}
