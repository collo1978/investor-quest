import { notFound } from "next/navigation";

import FinancialsSectionQuestClient from "./FinancialsSectionQuestClient";
import { isFinancialsQuestSlug } from "../financialsQuestSlugs";

export default async function FinancialsSectionQuestPage({
  params
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!isFinancialsQuestSlug(section)) {
    notFound();
  }
  return <FinancialsSectionQuestClient slug={section} />;
}
