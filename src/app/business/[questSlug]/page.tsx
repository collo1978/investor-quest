import BusinessQuestClient from "./BusinessQuestClient";
import {
  BUSINESS_QUEST_SLUGS,
  canonicalBusinessQuestSlug,
  isBusinessQuestSlug,
  isLegacyBusinessSlug,
  type BusinessQuestSlug
} from "@/app/business/businessQuestSlugs";

import { notFound, redirect } from "next/navigation";

export default async function BusinessQuestPage({
  params
}: {
  params: Promise<{ questSlug: string }>;
}) {
  const { questSlug } = await params;

  if (isLegacyBusinessSlug(questSlug)) {
    redirect(`/business/${canonicalBusinessQuestSlug(questSlug)}`);
  }

  if (!isBusinessQuestSlug(questSlug)) {
    notFound();
  }

  return <BusinessQuestClient slug={questSlug as BusinessQuestSlug} />;
}

export function generateStaticParams() {
  return BUSINESS_QUEST_SLUGS.map((questSlug) => ({ questSlug }));
}
