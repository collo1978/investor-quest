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
    id: "investors",
    ctaLabel: "GOT IT",
    lines: [
      {
        id: "investors-headline",
        text: "THE WORLD'S BEST INVESTORS SHARE ONE THING IN COMMON.",
        variant: "title"
      },
      {
        id: "investors-1",
        text: "They understand the business behind the stock.",
        variant: "intro"
      },
      {
        id: "investors-2",
        text: "You're about to start developing that same skill.",
        variant: "intro"
      }
    ]
  },
  {
    id: "ten-k",
    ctaLabel: "GOT IT",
    lines: [
      {
        id: "ten-k-1",
        text: "The 10-K (Annual Report) is the most important document great investors use to understand any company.",
        variant: "intro"
      },
      {
        id: "ten-k-2",
        text: "Most people never read it.",
        variant: "intro"
      },
      {
        id: "ten-k-3",
        text: "The best investors always do.",
        variant: "intro"
      }
    ]
  },
  {
    id: "island-quest",
    ctaLabel: "GOT IT",
    lines: [
      {
        id: "quest-1",
        text: "We've turned NVIDIA's 10-K into a fun interactive island quest.",
        variant: "intro"
      },
      {
        id: "quest-2",
        text: "We've removed the jargon, skipped the boring parts, and focused only on what matters.",
        variant: "intro"
      },
      {
        id: "quest-3",
        text: "Saving you hours.",
        variant: "body"
      }
    ]
  },
  {
    id: "mission",
    ctaLabel: "START BUSINESS ISLAND",
    lines: [
      {
        id: "mission-label",
        text: "YOUR MISSION",
        variant: "label-gold"
      },
      {
        id: "mission-body",
        text: "Conquer all 4 islands.",
        variant: "body"
      },
      {
        id: "objective-label",
        text: "OBJECTIVE",
        variant: "label-violet",
        sectionGap: true
      },
      {
        id: "objective-body",
        text: "Understand NVIDIA like a professional investor.",
        variant: "body-hero"
      },
      {
        id: "reward-label",
        text: "REWARD",
        variant: "label-gold",
        sectionGap: true
      },
      {
        id: "reward-body",
        text: "A rare skill that can stay with you for life.",
        variant: "body-reward"
      }
    ]
  }
] as const;

/** @deprecated Use step-specific labels from {@link SCHOOLS_MISSION_BRIEF_STEPS}. */
export const SCHOOLS_MISSION_BRIEF_CTA_LABEL = "START BUSINESS ISLAND";
