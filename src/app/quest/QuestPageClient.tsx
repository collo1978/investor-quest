"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { DynamicQuestDetailScreen } from "@/components/quest/DynamicQuestDetailScreen";
import { QuestRouteLoading } from "@/components/quest/QuestRouteLoading";
import { useGame } from "@/components/GameProvider";
import { BusinessQuestRouteLoading } from "@/components/business/BusinessQuestRouteLoading";
import { companyById, type CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { usePillarHubQuestData } from "@/hooks/usePillarHubQuestData";
import { buildManagementHubCards } from "@/lib/management/buildManagementHubCards";
import { pillarHasQuestPipeline } from "@/lib/quests/pillarQuestPipelineConfig";

type Props = {
  pillarId: PillarId;
  slug: string;
};

const DynamicPillarQuestWithPipeline = dynamic(
  () =>
    import("@/components/quest/PillarQuestWithPipeline").then((mod) => ({
      default: mod.PillarQuestWithPipeline
    })),
  { loading: () => <QuestRouteLoading /> }
);

function QuestPageClientInner({ pillarId, slug }: Props) {
  if (pillarHasQuestPipeline(pillarId)) {
    return <DynamicPillarQuestWithPipeline pillarId={pillarId} slug={slug} />;
  }

  return <DynamicQuestDetailScreen pillarId={pillarId} slug={slug} />;
}

export default function QuestPageClient({ pillarId, slug }: Props) {
  const { state, hydrated } = useGame();
  const router = useRouter();
  const companyId = state.activeCompanyId as CompanyId;

  const { quests, readSet, questViewBySlug } = usePillarHubQuestData(
    pillarId,
    companyId
  );

  const hubLocked = useMemo(() => {
    if (pillarId !== "management") return false;
    const cards = buildManagementHubCards(quests, questViewBySlug, readSet);
    return cards.find((c) => c.slug === slug)?.locked ?? false;
  }, [pillarId, slug, quests, questViewBySlug, readSet]);

  useEffect(() => {
    if (pillarId !== "management") return;
    if (!hydrated || !hubLocked) return;
    router.replace("/management");
  }, [pillarId, hydrated, hubLocked, router]);

  if (pillarId === "management" && (!hydrated || hubLocked)) {
    return <BusinessQuestRouteLoading />;
  }

  return <QuestPageClientInner pillarId={pillarId} slug={slug} />;
}
