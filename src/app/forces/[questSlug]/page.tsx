import { notFound, redirect } from "next/navigation";
import ForcesQuestClient from "./ForcesQuestClient";
import {
  isValidForcesQuestSlug,
  resolveForcesQuestSlug
} from "@/lib/forces/forcesQuestRoutes";

export default async function ForcesQuestPage({
  params
}: {
  params: Promise<{ questSlug: string }>;
}) {
  const { questSlug } = await params;
  const resolved = resolveForcesQuestSlug(questSlug);
  if (resolved !== questSlug) {
    redirect(`/forces/${resolved}`);
  }
  if (!isValidForcesQuestSlug(resolved)) {
    notFound();
  }
  return <ForcesQuestClient slug={resolved} />;
}
