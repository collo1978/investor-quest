import type { CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import type { PromptDraftOverrides } from "@/lib/ai/resolveActivePrompts";
import {
  runEvaluatedPreview,
  type EvaluatedPreviewResult
} from "@/lib/ai/promptPreviewEvaluation";

export type CompareSideInput = {
  label: string;
  versionId?: string | null;
  draft?: PromptDraftOverrides;
};

export type ComparePromptVersionsInput = {
  pillarId: PillarId;
  ticker: string;
  companyId: CompanyId;
  questSlug: string;
  cardId: string;
  templateId: string;
  sideA: CompareSideInput;
  sideB: CompareSideInput;
  saveEvaluations?: boolean;
};

export type ComparePromptVersionsResult = {
  ticker: string;
  pillarId: PillarId;
  questSlug: string;
  cardId: string;
  sideA: EvaluatedPreviewResult & { label: string };
  sideB: EvaluatedPreviewResult & { label: string };
  winner: "a" | "b" | "tie";
  winnerReason: string;
};

export async function comparePromptVersions(
  input: ComparePromptVersionsInput
): Promise<ComparePromptVersionsResult> {
  const base = {
    pillarId: input.pillarId,
    ticker: input.ticker,
    companyId: input.companyId,
    questSlug: input.questSlug,
    cardId: input.cardId,
    templateId: input.templateId,
    saveEvaluation: input.saveEvaluations ?? true
  };

  const [sideA, sideB] = await Promise.all([
    runEvaluatedPreview({
      ...base,
      versionId: input.sideA.versionId,
      draft: input.sideA.draft,
      compareLabel: `compare:${input.sideA.label}`
    }),
    runEvaluatedPreview({
      ...base,
      versionId: input.sideB.versionId,
      draft: input.sideB.draft,
      compareLabel: `compare:${input.sideB.label}`
    })
  ]);

  const scoreA = sideA.quality.compositeScore;
  const scoreB = sideB.quality.compositeScore;
  const delta = Math.abs(scoreA - scoreB);

  let winner: ComparePromptVersionsResult["winner"] = "tie";
  let winnerReason = "Scores are within 3 points — review tone and teaching flow manually.";

  if (delta > 3) {
    if (scoreA > scoreB) {
      winner = "a";
      winnerReason = `${input.sideA.label} leads on composite teaching quality (+${delta} pts).`;
    } else {
      winner = "b";
      winnerReason = `${input.sideB.label} leads on composite teaching quality (+${delta} pts).`;
    }
  }

  return {
    ticker: input.ticker,
    pillarId: input.pillarId,
    questSlug: input.questSlug,
    cardId: input.cardId,
    sideA: { ...sideA, label: input.sideA.label },
    sideB: { ...sideB, label: input.sideB.label },
    winner,
    winnerReason
  };
}
