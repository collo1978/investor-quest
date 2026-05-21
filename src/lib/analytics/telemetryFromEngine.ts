import type { CompanyId } from "@/data/companies";
import { companyById } from "@/data/companies";
import type { PillarId } from "@/data/pillars";
import type { GameAction, GameState, RewardEvent } from "@/engine";
import { splitQuestCardSlug, trackUserEvent } from "@/lib/analytics/trackUserEvent";

type CompanyCtx = {
  companyId: CompanyId;
  ticker: string;
  name: string;
};

function companyCtx(state: GameState): CompanyCtx {
  const c = companyById(state.activeCompanyId as CompanyId);
  return { companyId: c.id, ticker: c.ticker, name: c.name };
}

function trackForSlug(
  ctx: CompanyCtx,
  pillar: PillarId,
  slug: string,
  eventType: Parameters<typeof trackUserEvent>[0]["eventType"],
  extra?: Partial<Parameters<typeof trackUserEvent>[0]>
): void {
  const { questId, cardId } = splitQuestCardSlug(slug);
  trackUserEvent({
    companyTicker: ctx.ticker,
    companyName: ctx.name,
    pillar,
    questId,
    cardId,
    eventType,
    ...extra
  });
}

/**
 * Maps reducer actions to `user_activity_events`.
 * Called from GameProvider `onAction` — keeps quest pages unchanged.
 */
export function telemetryFromGameAction(
  action: GameAction,
  state: GameState
): void {
  const ctx = companyCtx(state);

  switch (action.type) {
    case "set-active-quest": {
      if (!action.slug) return;
      trackForSlug(ctx, action.pillarId, action.slug, "user_started_quest");
      return;
    }
    case "mark-quest-read": {
      trackForSlug(
        ctx,
        action.pillarId,
        action.slug,
        "user_marked_card_read"
      );
      return;
    }
    case "complete-quest": {
      trackForSlug(ctx, action.pillarId, action.slug, "user_completed_quiz", {
        metadata: { quizPerfect: Boolean(action.quizPerfect) }
      });
      return;
    }
    case "submit-conviction-and-advance": {
      const head = state.companies[state.activeCompanyId]?.pendingConvictionQueue[0];
      trackUserEvent({
        companyTicker: ctx.ticker,
        companyName: ctx.name,
        pillar: head?.completedPillarId ?? null,
        eventType: "user_updated_conviction",
        convictionStatus: "submitted",
        metadata: {
          pillarToUnlock: head?.pillarToUnlock ?? null
        }
      });
      return;
    }
    case "complete-ten-k-rookie-challenge": {
      trackUserEvent({
        companyTicker: ctx.ticker,
        companyName: ctx.name,
        eventType: "user_completed_company_report",
        metadata: { scoreFraction: action.scoreFraction }
      });
      return;
    }
    default:
      return;
  }
}

/** Maps reducer reward events (XP, badges, pillar clears). */
export function telemetryFromRewardEvents(
  events: RewardEvent[],
  state: GameState
): void {
  const ctx = companyCtx(state);

  for (const e of events) {
    if (e.kind === "xp") {
      trackUserEvent({
        companyTicker: ctx.ticker,
        companyName: ctx.name,
        eventType: "user_earned_xp",
        xpAmount: e.amount,
        metadata: { reason: e.reason }
      });
    } else if (e.kind === "badge") {
      trackUserEvent({
        companyTicker: ctx.ticker,
        companyName: ctx.name,
        eventType: "user_earned_badge",
        badgeName: e.badgeId,
        metadata: { badgeId: e.badgeId }
      });
    } else if (e.kind === "pillar-completed") {
      trackUserEvent({
        companyTicker: ctx.ticker,
        companyName: ctx.name,
        pillar: e.pillarId,
        eventType: "user_completed_pillar",
        metadata: { pillarId: e.pillarId }
      });
    } else if (e.kind === "all-pillars-complete") {
      trackUserEvent({
        companyTicker: ctx.ticker,
        companyName: ctx.name,
        eventType: "user_completed_company_report",
        metadata: { scope: "all_pillars" }
      });
    }
  }
}

/** Explicit card-open signal from quest reading UI. */
export function trackCardOpened(
  state: GameState,
  pillarId: PillarId,
  parentSlug: string,
  cardId: string
): void {
  const ctx = companyCtx(state);
  trackUserEvent({
    companyTicker: ctx.ticker,
    companyName: ctx.name,
    pillar: pillarId,
    questId: parentSlug,
    cardId,
    eventType: "user_opened_card"
  });
}
