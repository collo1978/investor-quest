import { PILLAR_META, type PillarId } from "@/data/pillars";
import { type PillarView } from "@/engine";
import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";
import { KHAN_MINUTES_PER_LESSON } from "@/lib/schools/schoolsKhanMapConfig";

export type KhanModuleVisualState =
  | "locked"
  | "available"
  | "in-progress"
  | "completed";

export function khanPillarHref(pillarId: PillarId, pathname: string): string {
  const route = PILLAR_META.find((p) => p.id === pillarId)?.route ?? `/${pillarId}`;
  const schoolsRoute = route.startsWith("/schools") ? route : `/schools${route}`;
  return resolveSchoolsLearnerHref(schoolsRoute, pathname);
}

export function khanFinalChallengeHref(pathname: string): string {
  return resolveSchoolsLearnerHref("/schools/final-challenge", pathname);
}

export function resolveKhanModuleState(
  pillarId: PillarId,
  pillarById: Record<PillarId, PillarView>
): KhanModuleVisualState {
  const pillar = pillarById[pillarId];
  if (!pillar) return "locked";
  if (pillar.completed) return "completed";
  if (!pillar.unlocked) return "locked";
  if (pillar.progressPct > 0) return "in-progress";
  return "available";
}

export function resolveKhanFinalState(
  finalUnlocked: boolean,
  finalCompleted: boolean
): KhanModuleVisualState {
  if (finalCompleted) return "completed";
  if (!finalUnlocked) return "locked";
  return "available";
}

export function khanEstimatedMinutesRemaining(pillar: PillarView): number {
  const remaining = Math.max(0, pillar.totalCount - pillar.completedCount);
  if (pillar.completed) return 0;
  if (remaining === 0 && pillar.totalCount > 0) return KHAN_MINUTES_PER_LESSON;
  return Math.max(KHAN_MINUTES_PER_LESSON, remaining * KHAN_MINUTES_PER_LESSON);
}

export function khanEstimatedMinutesTotal(pillar: PillarView): number {
  return Math.max(KHAN_MINUTES_PER_LESSON, pillar.totalCount * KHAN_MINUTES_PER_LESSON);
}

export function formatKhanDuration(minutes: number): string {
  if (minutes <= 0) return "Complete";
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
}
