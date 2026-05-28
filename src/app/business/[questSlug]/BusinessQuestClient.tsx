"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import type { BusinessQuestSlug } from "@/app/business/businessQuestSlugs";
import { useGame } from "@/components/GameProvider";
import { BusinessQuestRouteLoading } from "@/components/business/BusinessQuestRouteLoading";
import { QuestDetailScreen } from "@/components/QuestDetailScreen";
import { companyById, type CompanyId } from "@/data/companies";
import { findQuestDefinition } from "@/data/quests/library";
import { usePillarHubQuestData } from "@/hooks/usePillarHubQuestData";
import { usePillarQuestGeneratedContent } from "@/hooks/usePillarQuestGeneratedContent";
import { markBusinessIslandBriefSeen } from "@/lib/businessIslandBriefSession";
import { resolveBusinessHubCardBySlug } from "@/lib/business/resolveBusinessHubCardBySlug";
import { mergeGeneratedQuestContent } from "@/lib/quests/mergeGeneratedQuestContent";

type Props = {
  slug: BusinessQuestSlug;
};

function BusinessQuestWithPipeline({ slug }: { slug: BusinessQuestSlug }) {
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
  } = usePillarQuestGeneratedContent("business", company.ticker, slug);

  const questOverride = useMemo(() => {
    const base = findQuestDefinition(companyId, "business", slug);
    if (!base) return null;
    if (!payload?.cards || Object.keys(payload.cards).length === 0) {
      return base;
    }
    return mergeGeneratedQuestContent(base, payload.cards, {
      pipelineGenerating: generating
    });
  }, [companyId, slug, payload?.cards, generating]);

  return (
    <QuestDetailScreen
      pillarId="business"
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

export default function BusinessQuestClient({ slug }: Props) {
  const { actions, state, hydrated } = useGame();
  const router = useRouter();
  const companyId = state.activeCompanyId as CompanyId;

  const { quests, readSet, questViewBySlug } = usePillarHubQuestData(
    "business",
    companyId
  );

  const hubCard = useMemo(
    () => resolveBusinessHubCardBySlug(quests, questViewBySlug, readSet, slug),
    [quests, questViewBySlug, readSet, slug]
  );

  useEffect(() => {
    markBusinessIslandBriefSeen();
    actions.dismissBusinessIslandBrief();
  }, [actions]);

  useEffect(() => {
    if (!hydrated || !hubCard?.locked) return;
    router.replace("/business");
  }, [hydrated, hubCard?.locked, router]);

  if (hubCard?.locked) {
    return <BusinessQuestRouteLoading />;
  }

  if (!hydrated) {
    return <BusinessQuestRouteLoading />;
  }

  return <BusinessQuestWithPipeline slug={slug} />;
}
