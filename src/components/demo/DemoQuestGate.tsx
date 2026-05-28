"use client";

import { useMemo } from "react";

import QuestPageClient from "@/app/quest/QuestPageClient";
import { DemoComingSoonPanel } from "@/components/demo/DemoComingSoonPanel";
import { QuestRouteLoading } from "@/components/quest/QuestRouteLoading";
import { useGame } from "@/components/GameProvider";
import { companyById, type CompanyId } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import { pillarById } from "@/data/pillars";
import { findQuestDefinition } from "@/data/quests/library";
import { usePillarQuestGeneratedContent } from "@/hooks/usePillarQuestGeneratedContent";
import { NVDA_DEMO_GATE, NVDA_DEMO_GATE_PILLAR } from "@/lib/demo/nvidiaDemoVoice";
import {
  isDemoQuestPlayable,
  isPillarComingSoon,
  isPlayableDemoCompanyId
} from "@/lib/demo/playableDemo";
import { pillarHasQuestPipeline } from "@/lib/quests/pillarQuestPipelineConfig";

type Props = {
  pillarId: PillarId;
  slug: string;
};

export function DemoQuestGate({ pillarId, slug }: Props) {
  const { state } = useGame();
  const companyId = state.activeCompanyId as CompanyId;
  const company = companyById(companyId);
  const pillar = pillarById(pillarId);
  const quest = findQuestDefinition(companyId, pillarId, slug);

  const pipelineEnabled = pillarHasQuestPipeline(pillarId);
  const { payload, generating, canReadQuest } = usePillarQuestGeneratedContent(
    pillarId,
    company.ticker,
    slug
  );

  const playable = useMemo(() => {
    if (!quest) return false;
    return isDemoQuestPlayable(companyId, pillarId, slug, {
      generatedCards: payload?.cards ?? null,
      pipelineGenerating: generating
    });
  }, [companyId, pillarId, slug, quest, payload?.cards, generating]);

  if (!isPlayableDemoCompanyId(companyId)) {
    return (
      <DemoComingSoonPanel
        title={NVDA_DEMO_GATE.wrongCompanyTitle}
        message={NVDA_DEMO_GATE.wrongCompany}
        backHref="/map"
        backLabel="Back to map"
      />
    );
  }

  if (isPillarComingSoon(companyId, pillarId)) {
    return (
      <DemoComingSoonPanel
        title={`${pillar.title} — ${company.ticker}`}
        message={NVDA_DEMO_GATE_PILLAR}
        backHref={pillar.route}
        backLabel={`Back to ${pillar.title}`}
      />
    );
  }

  if (!quest) {
    return (
      <DemoComingSoonPanel
        title={NVDA_DEMO_GATE.questMissingTitle}
        message={NVDA_DEMO_GATE.questMissing}
        backHref={pillar.route}
        backLabel={`Back to ${pillar.title}`}
      />
    );
  }

  if (pipelineEnabled && generating && !canReadQuest && !playable) {
    return <QuestRouteLoading />;
  }

  if (!playable && !generating) {
    return (
      <DemoComingSoonPanel
        title={quest.title}
        message={NVDA_DEMO_GATE.questMissing}
        backHref={pillar.route}
        backLabel={`Back to ${pillar.title}`}
      />
    );
  }

  return <QuestPageClient pillarId={pillarId} slug={slug} />;
}
