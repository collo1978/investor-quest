import { PILLAR_META, type PillarId } from "@/data/pillars";
import { type PillarView } from "@/engine";
import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";

export type CartoonNodeVisualState =
  | "locked"
  | "available"
  | "in-progress"
  | "completed";

export function cartoonPillarHref(pillarId: PillarId, pathname: string): string {
  const route = PILLAR_META.find((p) => p.id === pillarId)?.route ?? `/${pillarId}`;
  const schoolsRoute = route.startsWith("/schools") ? route : `/schools${route}`;
  return resolveSchoolsLearnerHref(schoolsRoute, pathname);
}

export function cartoonFinalChallengeHref(pathname: string): string {
  return resolveSchoolsLearnerHref("/schools/final-challenge", pathname);
}

export function resolveCartoonPillarState(
  pillarId: PillarId,
  pillarById: Record<PillarId, PillarView>
): CartoonNodeVisualState {
  const pillar = pillarById[pillarId];
  if (!pillar) return "locked";
  if (pillar.completed) return "completed";
  if (!pillar.unlocked) return "locked";
  if (pillar.progressPct > 0) return "in-progress";
  return "available";
}

export function resolveCartoonHubState(
  finalUnlocked: boolean,
  finalCompleted: boolean
): CartoonNodeVisualState {
  if (finalCompleted) return "completed";
  if (!finalUnlocked) return "locked";
  return "available";
}
