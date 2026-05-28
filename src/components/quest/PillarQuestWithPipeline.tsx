"use client";

import { useMemo } from "react";

import { DynamicQuestDetailScreen } from "@/components/quest/DynamicQuestDetailScreen";
import { useGame } from "@/components/GameProvider";
import { companyById, type CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { findQuestDefinition } from "@/data/quests/library";
import { usePillarQuestGeneratedContent } from "@/hooks/usePillarQuestGeneratedContent";
import { CONTROLLED_DEMO_MODE } from "@/lib/demo/controlledDemo";
import { isDemoQuestPlayable } from "@/lib/demo/playableDemo";
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
    return mergeGeneratedQuestContent(base, payload.cards, {
      pipelineGenerating: generating
    });
  }, [companyId, pillarId, slug, payload?.cards, generating]);

  const curatedDemoReady =
    CONTROLLED_DEMO_MODE &&
    isDemoQuestPlayable(companyId, pillarId, slug, {
      generatedCards: payload?.cards ?? null,
      pipelineGenerating: generating
    });

  if (!pillarHasQuestPipeline(pillarId)) {
    return <DynamicQuestDetailScreen pillarId={pillarId} slug={slug} />;
  }

  const questPipeline = curatedDemoReady
    ? {
        status: "ready" as const,
        sourceLabel: null,
        generating: false,
        pipelinePhase: "idle" as const,
        progress: null,
        loadingCardIds: [] as string[],
        canReadQuest: true,
        compact: false,
        error: null,
        onRetry: () => void retryGenerate()
      }
    : {
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
      };

  return (
    <DynamicQuestDetailScreen
      pillarId={pillarId}
      slug={slug}
      questOverride={questOverride ?? undefined}
      questPipeline={questPipeline}
    />
  );
}
