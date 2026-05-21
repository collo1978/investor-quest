import { notFound } from "next/navigation";
import ForcesCategoryPageClient from "@/app/forces/ForcesCategoryPageClient";
import { isForcesCategoryId } from "@/data/quests/forcesCategories";

export default async function ForcesCategoryPage({
  params
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  if (!isForcesCategoryId(categoryId)) {
    notFound();
  }
  return <ForcesCategoryPageClient categoryId={categoryId} />;
}
