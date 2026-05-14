import { notFound } from "next/navigation";
import ForcesQuestClient from "./ForcesQuestClient";

const QUEST_SLUGS = ["inside-forces", "outside-forces"] as const;
type QuestSlug = (typeof QUEST_SLUGS)[number];

export default async function ForcesQuestPage({
  params
}: {
  params: Promise<{ questSlug: string }>;
}) {
  const { questSlug } = await params;
  if (!QUEST_SLUGS.includes(questSlug as QuestSlug)) {
    notFound();
  }
  return <ForcesQuestClient slug={questSlug as QuestSlug} />;
}
