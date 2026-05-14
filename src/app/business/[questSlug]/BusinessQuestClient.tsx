"use client";

import { QuestDetailScreen } from "@/components/QuestDetailScreen";

type Props = {
  slug: "snapshot" | "revenue" | "operations" | "advantage" | "industry";
};

/**
 * Business pillar quest detail. Thin wrapper that delegates to the
 * reusable {@link QuestDetailScreen} so every pillar renders the same
 * gold quest-card layout. Working Space / Notes / Artifact / AI Task
 * panels were intentionally dropped from the MVP per the new spec —
 * reading content + Mark-as-Read is the only surface here.
 */
export default function BusinessQuestClient({ slug }: Props) {
  return <QuestDetailScreen pillarId="business" slug={slug} />;
}
