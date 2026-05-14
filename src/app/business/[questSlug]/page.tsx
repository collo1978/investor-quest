import BusinessQuestClient from "./BusinessQuestClient";

const QUEST_SLUGS = [
  "snapshot",
  "revenue",
  "operations",
  "advantage",
  "industry"
] as const;

type QuestSlug = (typeof QUEST_SLUGS)[number];

import { notFound } from "next/navigation";

export default async function BusinessQuestPage({
  params
}: {
  params: Promise<{ questSlug: string }>;
}) {
  const { questSlug } = await params;
  if (!QUEST_SLUGS.includes(questSlug as QuestSlug)) {
    notFound();
  }
  return <BusinessQuestClient slug={questSlug as QuestSlug} />;
}
