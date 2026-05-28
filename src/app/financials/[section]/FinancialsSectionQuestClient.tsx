"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { DynamicQuestDetailScreen } from "@/components/quest/DynamicQuestDetailScreen";
import type { FinancialsQuestSlug } from "../financialsQuestSlugs";
import { useGame } from "@/components/GameProvider";
import { BusinessQuestRouteLoading } from "@/components/business/BusinessQuestRouteLoading";
import { companyById, type CompanyId } from "@/data/companies";
import { findQuestDefinition } from "@/data/quests/library";
import { useFinancialQuestGeneratedContent } from "@/hooks/useFinancialQuestGeneratedContent";
import { usePillarHubQuestData } from "@/hooks/usePillarHubQuestData";
import { buildFinancialsHubCards } from "@/lib/financials/buildFinancialsHubCards";
import { mergeGeneratedQuestContent } from "@/lib/quests/mergeGeneratedQuestContent";

type Props = {
  slug: FinancialsQuestSlug;
};

function FinancialsSectionQuestWithPipeline({ slug }: { slug: FinancialsQuestSlug }) {
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

export default function FinancialsSectionQuestClient({ slug }: Props) {
  const { state, hydrated } = useGame();
  const router = useRouter();
  const companyId = state.activeCompanyId as CompanyId;

  const { quests, readSet, questViewBySlug } = usePillarHubQuestData(
    "financials",
    companyId
  );

  const hubCard = useMemo(() => {
    const cards = buildFinancialsHubCards(quests, questViewBySlug, readSet);
    return cards.find((c) => c.slug === slug) ?? null;
  }, [quests, questViewBySlug, readSet, slug]);

  useEffect(() => {
    if (!hydrated || !hubCard?.locked) return;
    router.replace("/financials");
  }, [hydrated, hubCard?.locked, router]);

  if (!hydrated || hubCard?.locked) {
    return <BusinessQuestRouteLoading />;
  }

  return <FinancialsSectionQuestWithPipeline slug={slug} />;
}
