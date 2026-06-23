export const SCHOOLS_LOGO_REVEAL_ROUTE = "/schools/logo-reveal";

export const SCHOOLS_LOGO_REVEAL_LOGO_SRC = "/logos/current-schools-logo.png";

export const SCHOOLS_LOGO_REVEAL = {
  logoSrc: SCHOOLS_LOGO_REVEAL_LOGO_SRC,
  dragHeadline: "DRAG TO UNLOCK",
  beginnerLabel: "BEGINNER",
  smartInvestorLabel: "SMARTER INVESTOR",
  cta: "START YOUR FIRST QUEST"
} as const;

/** Milestone positions along the quest path (0–1). */
export const SCHOOLS_LOGO_REVEAL_QUEST_MILESTONES = [0.25, 0.5, 0.75] as const;

/** Orb horizontal travel as % of quest path row width. */
export const SCHOOLS_LOGO_REVEAL_ORB_TRAVEL_MAX_PCT = 90;

/** Logo float-in + brighten. */
export const SCHOOLS_LOGO_REVEAL_LOGO_ENTER_MS = 1180;
/** Purple glow behind QUEST builds after logo starts. */
export const SCHOOLS_LOGO_REVEAL_GLOW_BUILD_MS = 1500;
export const SCHOOLS_LOGO_REVEAL_GLOW_DELAY_MS = 280;

/** Drag headline fades in after logo lands. */
export const SCHOOLS_LOGO_REVEAL_JOURNEY_HEADLINE_DELAY_MS = 380;
/** Drag track + locked CTA appear after headline. */
export const SCHOOLS_LOGO_REVEAL_JOURNEY_METER_DELAY_MS = 460;

/** Drag must reach this progress to unlock (0–1). */
export const SCHOOLS_LOGO_REVEAL_UNLOCK_PROGRESS = 0.97;

/** One-shot CTA attract pulse after unlock. */
export const SCHOOLS_LOGO_REVEAL_CTA_UNLOCK_PULSE_MS = 880;
