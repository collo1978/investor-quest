"use client";

import { useMemo } from "react";

import { DynamicQuestDetailScreen } from "@/components/quest/DynamicQuestDetailScreen";
import type { FinancialsQuestSlug } from "../financialsQuestSlugs";
import { useGame } from "@/components/GameProvider";
import { companyById, type CompanyId } from "@/data/companies";
import { findQuestDefinition } from "@/data/quests/library";
import { useFinancialQuestGeneratedContent } from "@/hooks/useFinancialQuestGeneratedContent";
import { mergeGeneratedQuestContent } from "@/lib/quests/mergeGeneratedQuestContent";

type Props = {
  slug: FinancialsQuestSlug;
};

export default function FinancialsSectionQuestClient({ slug }: Props) {
  const { state } = useGame();
  const companyId = state.activeCompanyId as CompanyId;
  const company = companyById(companyId);

  const {
    payload,
    generating,
    pipelinePhase,
    progress,
    error,
    retryGenerate,
    loadingCardIds,
    canReadQuest
  } = useFinancialQuestGeneratedContent(company.ticker, slug);

  const questOverride = useMemo(() => {
    const base = findQuestDefinition(companyId, "financials", slug);
    if (!base) return null;
    if (!payload?.cards || Object.keys(payload.cards).length === 0) {
      return base;
    }
    return mergeGeneratedQuestContent(base, payload.cards);
  }, [companyId, slug, payload?.cards]);

  return (
    <DynamicQuestDetailScreen
      pillarId="financials"
      slug={slug}
      questOverride={questOverride}
      questPipeline={{
        status: payload?.status ?? null,
        sourceLabel: payload?.sourceLabel ?? null,
        generating,
        pipelinePhase,
        progress,
        loadingCardIds,
        canReadQuest,
        compact: Boolean(canReadQuest && generating),
        error,
        onRetry: () => void retryGenerate()
      }}
    />
  );
}
