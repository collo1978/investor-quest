"use client";

import { QuestDetailScreen } from "@/components/QuestDetailScreen";
import type { FinancialsQuestSlug } from "../financialsQuestSlugs";

type Props = {
  slug: FinancialsQuestSlug;
};

export default function FinancialsSectionQuestClient({ slug }: Props) {
  return <QuestDetailScreen pillarId="financials" slug={slug} />;
}
