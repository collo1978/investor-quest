"use client";

import { PillarQuestWithPipeline } from "@/components/quest/PillarQuestWithPipeline";
import { DynamicQuestDetailScreen } from "@/components/quest/DynamicQuestDetailScreen";
import { isForcesHubSlug, isForcesTopicSlug } from "@/lib/sec/forcesTopicSectionMap";

type Props = {
  slug: string;
};

export default function ForcesQuestClient({ slug }: Props) {
  if (isForcesHubSlug(slug) || !isForcesTopicSlug(slug)) {
    return <DynamicQuestDetailScreen pillarId="forces" slug={slug} />;
  }

  return <PillarQuestWithPipeline pillarId="forces" slug={slug} />;
}
