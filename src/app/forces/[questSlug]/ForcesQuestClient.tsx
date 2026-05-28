"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { PillarQuestWithPipeline } from "@/components/quest/PillarQuestWithPipeline";
import { DynamicQuestDetailScreen } from "@/components/quest/DynamicQuestDetailScreen";
import { useGame } from "@/components/GameProvider";
import { BusinessQuestRouteLoading } from "@/components/business/BusinessQuestRouteLoading";
import { companyById, type CompanyId } from "@/data/companies";
import { usePillarHubQuestData } from "@/hooks/usePillarHubQuestData";
import { buildForcesHubCards } from "@/lib/forces/buildForcesHubCards";
import { resolveForcesQuestSlug } from "@/lib/forces/forcesQuestRoutes";
import { isForcesHubSlug, isForcesTopicSlug } from "@/lib/sec/forcesTopicSectionMap";

type Props = {
  slug: string;
};

function ForcesQuestContent({ slug }: Props) {
  if (isForcesHubSlug(slug) || !isForcesTopicSlug(slug)) {
    return <DynamicQuestDetailScreen pillarId="forces" slug={slug} />;
  }

  return <PillarQuestWithPipeline pillarId="forces" slug={slug} />;
}

export default function ForcesQuestClient({ slug }: Props) {
  const { state, hydrated } = useGame();
  const router = useRouter();
  const routeSlug = resolveForcesQuestSlug(slug);
  const companyId = state.activeCompanyId as CompanyId;

  useEffect(() => {
    if (routeSlug !== slug) {
      router.replace(`/forces/${routeSlug}`);
    }
  }, [slug, routeSlug, router]);

  const { quests, readSet, questViewBySlug } = usePillarHubQuestData(
    "forces",
    companyId
  );

  const routeLocked = useMemo(() => {
    if (isForcesTopicSlug(routeSlug)) {
      const view = questViewBySlug[routeSlug];
      return view ? !view.unlocked : false;
    }

    const cards = buildForcesHubCards(quests, questViewBySlug, readSet, companyId);
    const hubCard = cards.find((c) => c.slug === routeSlug);
    if (hubCard) return hubCard.locked;

    const view = questViewBySlug[routeSlug];
    return view ? !view.unlocked : false;
  }, [routeSlug, quests, questViewBySlug, readSet, companyId]);

  useEffect(() => {
    if (!hydrated || !routeLocked) return;
    router.replace("/forces");
  }, [hydrated, routeLocked, router]);

  if (!hydrated || routeLocked) {
    return <BusinessQuestRouteLoading />;
  }

  if (routeSlug !== slug) {
    return <BusinessQuestRouteLoading />;
  }

  return <ForcesQuestContent slug={routeSlug} />;
}
