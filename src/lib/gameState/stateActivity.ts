import type { GameState } from "@/engine/progression/state";

/** Highest progressRevision across all companies (destructive-reset ordering). */
export function getMaxProgressRevision(state: GameState): number {
  let max = 0;
  for (const prog of Object.values(state.companies)) {
    max = Math.max(max, prog.progressRevision ?? 0);
  }
  return max;
}

/**
 * Monotonic activity timestamp for cross-tab stale detection.
 * Uses lastActivityAt plus the newest read/completion/badge timestamps so
 * older saves without stamped activity still compare correctly.
 */
export function getGameStateActivityTimestamp(state: GameState): number {
  let ts = state.lastActivityAt ?? 0;

  for (const prog of Object.values(state.companies)) {
    ts = Math.max(ts, prog.lastActivityAt ?? 0);

    for (const pillar of Object.values(prog.pillars)) {
      for (const readAt of Object.values(pillar.readAt)) {
        ts = Math.max(ts, readAt);
      }
      for (const completedAt of Object.values(pillar.completedAt)) {
        ts = Math.max(ts, completedAt);
      }
    }

    for (const badge of Object.values(prog.badges)) {
      ts = Math.max(ts, badge.awardedAt);
    }

    if (prog.tenKRookieChallenge?.passedAt) {
      ts = Math.max(ts, prog.tenKRookieChallenge.passedAt);
    }
    if (prog.futureArcRevealedAt) {
      ts = Math.max(ts, prog.futureArcRevealedAt);
    }
    if (prog.questMapBriefDismissedAt) {
      ts = Math.max(ts, prog.questMapBriefDismissedAt);
    }
    if (prog.businessIslandBriefDismissedAt) {
      ts = Math.max(ts, prog.businessIslandBriefDismissedAt);
    }

    for (const submittedAt of Object.values(prog.pillarConvictionSubmittedAt)) {
      if (typeof submittedAt === "number") ts = Math.max(ts, submittedAt);
    }

    for (const work of Object.values(prog.questWork)) {
      const mini = work.mini;
      if (mini?.quiz?.lastPlayedAt) ts = Math.max(ts, mini.quiz.lastPlayedAt);
      if (mini?.board?.lastPlayedAt) ts = Math.max(ts, mini.board.lastPlayedAt);
      if (mini?.terminal?.lastPlayedAt) {
        ts = Math.max(ts, mini.terminal.lastPlayedAt);
      }
    }
  }

  if (state.onboarding.completedAt) {
    ts = Math.max(ts, state.onboarding.completedAt);
  }

  return ts;
}
