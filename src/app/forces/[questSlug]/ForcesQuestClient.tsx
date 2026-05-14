"use client";

import { QuestDetailScreen } from "@/components/QuestDetailScreen";

type Props = {
  slug: "inside-forces" | "outside-forces";
};

export default function ForcesQuestClient({ slug }: Props) {
  return <QuestDetailScreen pillarId="forces" slug={slug} />;
}
