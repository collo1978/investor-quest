import { PILLAR_META, type PillarId } from "@/data/pillars";
import { type PillarView } from "@/engine";
import {
  DUOLINGO_BOARD_PILLARS,
  DUOLINGO_BOARD_HUB,
  type DuolingoMapNode,
  type DuolingoMapPillarNode
} from "@/lib/schools/schoolsDuolingoMapConfig";
import { resolveSchoolsLearnerHref } from "@/lib/schools/schoolsDemoHref";

export type DuolingoNodeVisualState =
  | "locked"
  | "available"
  | "in-progress"
  | "completed";

export function duolingoPillarHref(pillarId: PillarId, pathname: string): string {
  const route = PILLAR_META.find((p) => p.id === pillarId)?.route ?? `/${pillarId}`;
  const schoolsRoute = route.startsWith("/schools") ? route : `/schools${route}`;
  return resolveSchoolsLearnerHref(schoolsRoute, pathname);
}

export function duolingoFinalChallengeHref(pathname: string): string {
  return resolveSchoolsLearnerHref("/schools/final-challenge", pathname);
}

export function resolveDuolingoPillarState(
  pillarId: PillarId,
  pillarById: Record<PillarId, PillarView>
): DuolingoNodeVisualState {
  const pillar = pillarById[pillarId];
  if (!pillar) return "locked";
  if (pillar.completed) return "completed";
  if (!pillar.unlocked) return "locked";
  if (pillar.progressPct > 0) return "in-progress";
  return "available";
}

export function resolveDuolingoHubState(
  finalUnlocked: boolean,
  finalCompleted: boolean
): DuolingoNodeVisualState {
  if (finalCompleted) return "completed";
  if (!finalUnlocked) return "locked";
  return "available";
}

export function duolingoPillarNode(id: PillarId): DuolingoMapPillarNode {
  const node = DUOLINGO_BOARD_PILLARS.find((n) => n.id === id);
  if (!node) throw new Error(`Unknown duolingo pillar: ${id}`);
  return node;
}

export function duolingoHubNode(): DuolingoMapNode {
  return DUOLINGO_BOARD_HUB;
}
