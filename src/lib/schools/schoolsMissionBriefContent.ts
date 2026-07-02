export const SCHOOLS_MISSION_BRIEF_NVDA_LOGO = "/logos/companies/nvda.svg";

export type SchoolsMissionBriefTypeVariant =
  | "title"
  | "intro"
  | "label-gold"
  | "label-violet"
  | "body"
  | "body-hero"
  | "body-reward";

export type SchoolsMissionBriefTypeLine = {
  id: string;
  text: string;
  variant: SchoolsMissionBriefTypeVariant;
  sectionGap?: boolean;
};

export type SchoolsMissionBriefStep = {
  id: string;
  ctaLabel: string;
  lines: readonly SchoolsMissionBriefTypeLine[];
};

export const SCHOOLS_MISSION_BRIEF_STEPS: readonly SchoolsMissionBriefStep[] = [
  {
    id: "welcome",
    ctaLabel: "GOT IT",
    lines: [
      {
        id: "welcome-headline",
        text: "WELCOME TO NVIDIA'S 10-K",
        variant: "title"
      },
      {
        id: "welcome-1",
        text: "This is NVIDIA's Annual Report.",
        variant: "intro"
      },
      {
        id: "welcome-2",
        text: "It's the most important document great investors use to understand a company before investing.",
        variant: "intro"
      }
    ]
  },
  {
    id: "island-quest",
    ctaLabel: "GOT IT",
    lines: [
      {
        id: "quest-label",
        text: "YOUR ISLAND QUEST",
        variant: "label-gold"
      },
      {
        id: "quest-1",
        text: "NVIDIA's 10-K is over 80,000 words long.",
        variant: "intro"
      },
      {
        id: "quest-2",
        text: "We've transformed NVIDIA's 10-K into an interactive island adventure.",
        variant: "intro"
      },
      {
        id: "quest-3",
        text: "We've removed the jargon.",
        variant: "intro"
      },
      {
        id: "quest-4",
        text: "Skipped the boring parts.",
        variant: "intro"
      },
      {
        id: "quest-5",
        text: "And focused only on what matters.",
        variant: "intro"
      },
      {
        id: "quest-6",
        text: "Saving you hours of research.",
        variant: "body"
      }
    ]
  },
  {
    id: "mission",
    ctaLabel: "GOT IT",
    lines: [
      {
        id: "mission-label",
        text: "YOUR MISSION",
        variant: "label-gold"
      },
      {
        id: "mission-body-1",
        text: "Conquer all 4 islands.",
        variant: "body"
      },
      {
        id: "mission-body-2",
        text: "Unlock the Final Challenge.",
        variant: "body"
      }
    ]
  },
  {
    id: "reward",
    ctaLabel: "START BUSINESS ISLAND",
    lines: [
      {
        id: "reward-label",
        text: "REWARD",
        variant: "label-gold"
      },
      {
        id: "reward-badge",
        text: "🏅 10K Rookie Badge",
        variant: "body-hero"
      },
      {
        id: "reward-body",
        text: "The first step on your journey to becoming a smarter investor.",
        variant: "body-reward"
      }
    ]
  }
] as const;

/** Typed envelope brief on the Prodigy map — paragraph-by-paragraph with Continue. */
export const SCHOOLS_ENVELOPE_MISSION_BRIEF_STEPS: readonly SchoolsMissionBriefStep[] = [
  {
    id: "welcome",
    ctaLabel: "Continue",
    lines: [
      {
        id: "envelope-welcome-1",
        text: "Welcome to NVIDIA's 10-K (Annual Report).",
        variant: "title"
      },
      {
        id: "envelope-welcome-2",
        text: "This is where every great investor starts.",
        variant: "intro"
      }
    ]
  },
  {
    id: "boring",
    ctaLabel: "Continue",
    lines: [
      {
        id: "envelope-boring",
        text: "NVIDIA's 10-K is 80,000 words long and, let's be honest, incredibly boring.",
        variant: "intro"
      }
    ]
  },
  {
    id: "adventure",
    ctaLabel: "Continue",
    lines: [
      {
        id: "envelope-adventure",
        text: "We've removed the jargon, kept only what matters, and transformed it into an interactive adventure.",
        variant: "intro"
      }
    ]
  },
  {
    id: "discover",
    ctaLabel: "Continue",
    lines: [
      {
        id: "envelope-discover",
        text: "You're about to discover how great investors analyse NVIDIA and become a better investor, faster.",
        variant: "body"
      }
    ]
  },
  {
    id: "mission",
    ctaLabel: "Begin Mission",
    lines: [
      {
        id: "envelope-mission",
        text: "MISSION: Conquer all 4 islands and unlock the Final Challenge.",
        variant: "label-gold"
      }
    ]
  }
] as const;

/** @deprecated Use step-specific labels from {@link SCHOOLS_MISSION_BRIEF_STEPS}. */
export const SCHOOLS_MISSION_BRIEF_CTA_LABEL = "START BUSINESS ISLAND";
