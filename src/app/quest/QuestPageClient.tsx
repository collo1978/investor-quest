"use client";

import { PillarQuestWithPipeline } from "@/components/quest/PillarQuestWithPipeline";
import { DynamicQuestDetailScreen } from "@/components/quest/DynamicQuestDetailScreen";
import type { PillarId } from "@/data/pillars";
import { pillarHasQuestPipeline } from "@/lib/quests/pillarQuestPipelineConfig";

type Props = {
  pillarId: PillarId;
  slug: string;
};

export default function QuestPageClient({ pillarId, slug }: Props) {
  if (pillarHasQuestPipeline(pillarId)) {
    return <PillarQuestWithPipeline pillarId={pillarId} slug={slug} />;
  }

  return <DynamicQuestDetailScreen pillarId={pillarId} slug={slug} />;
}
