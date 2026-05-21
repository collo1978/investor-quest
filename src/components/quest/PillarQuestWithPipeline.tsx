"use client";

import { useMemo } from "react";

import { DynamicQuestDetailScreen } from "@/components/quest/DynamicQuestDetailScreen";
import { useGame } from "@/components/GameProvider";
import { companyById, type CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { findQuestDefinition } from "@/data/quests/library";
import { usePillarQuestGeneratedContent } from "@/hooks/usePillarQuestGeneratedContent";
import { mergeGeneratedQuestContent } from "@/lib/quests/mergeGeneratedQuestContent";
import { pillarHasQuestPipeline } from "@/lib/quests/pillarQuestPipelineConfig";

type Props = {
  pillarId: PillarId;
  slug: string;
};

/**
 * Quest detail with SEC → generate → merge pipeline (all AI islands).
 */
export function PillarQuestWithPipeline({ pillarId, slug }: Props) {
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
  } = usePillarQuestGeneratedContent(pillarId, company.ticker, slug);

  const questOverride = useMemo(() => {
    const base = findQuestDefinition(companyId, pillarId, slug);
    if (!base) return null;
    if (!payload?.cards || Object.keys(payload.cards).length === 0) {
      return base;
    }
    return mergeGeneratedQuestContent(base, payload.cards);
  }, [companyId, pillarId, slug, payload?.cards]);

  if (!pillarHasQuestPipeline(pillarId)) {
    return <DynamicQuestDetailScreen pillarId={pillarId} slug={slug} />;
  }

  return (
    <DynamicQuestDetailScreen
      pillarId={pillarId}
      slug={slug}
      questOverride={questOverride ?? undefined}
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
