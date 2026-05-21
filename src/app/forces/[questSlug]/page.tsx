import { notFound } from "next/navigation";
import ForcesQuestClient from "./ForcesQuestClient";
import { getPillarQuestTemplates } from "@/platform/quests/questContentRegistry";

export default async function ForcesQuestPage({
  params
}: {
  params: Promise<{ questSlug: string }>;
}) {
  const { questSlug } = await params;
  const exists = getPillarQuestTemplates("forces").some((q) => q.slug === questSlug);
  if (!exists) {
    notFound();
  }
  return <ForcesQuestClient slug={questSlug} />;
}
