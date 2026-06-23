export const SCHOOLS_MISSION_BRIEF_CARDS_ROUTE = "/schools/mission-brief-cards";

export const MISSION_BRIEF_CARDS_CHAR_MS = 34;
export const MISSION_BRIEF_CARDS_LINE_GAP_MS = 320;
export const MISSION_BRIEF_CARDS_CARD_ENTER_MS = 480;

export type MissionBriefTextPart = {
  text: string;
  highlight?: boolean;
};

export type MissionBriefLineVariant = "eyebrow" | "heading" | "body";

export type MissionBriefTypedLine = {
  id: string;
  variant: MissionBriefLineVariant;
  parts: readonly MissionBriefTextPart[];
};

export type MissionBriefCard = {
  id: string;
  eyebrow?: string;
  heading: string;
  bodyLines: ReadonlyArray<readonly MissionBriefTextPart[]>;
};

export function flattenMissionBriefParts(parts: readonly MissionBriefTextPart[]): string {
  return parts.map((part) => part.text).join("");
}

export function missionBriefPartsLength(parts: readonly MissionBriefTextPart[]): number {
  return flattenMissionBriefParts(parts).length;
}

export function buildMissionBriefCardTypeQueue(card: MissionBriefCard): MissionBriefTypedLine[] {
  const lines: MissionBriefTypedLine[] = [];

  if (card.eyebrow) {
    lines.push({
      id: `${card.id}-eyebrow`,
      variant: "eyebrow",
      parts: [{ text: card.eyebrow }]
    });
  }

  lines.push({
    id: `${card.id}-heading`,
    variant: "heading",
    parts: [{ text: card.heading }]
  });

  card.bodyLines.forEach((parts, index) => {
    lines.push({ id: `${card.id}-body-${index}`, variant: "body", parts });
  });

  return lines;
}

export const MISSION_BRIEF_CARDS: readonly MissionBriefCard[] = [
  {
    id: "problem",
    eyebrow: "MISSION BRIEF",
    heading: "PROBLEM DETECTED",
    bodyLines: [
      [
        { text: "Millions of people make " },
        { text: "uninformed decisions", highlight: true },
        { text: " when buying " },
        { text: "stocks", highlight: true },
        { text: "." }
      ]
    ]
  },
  {
    id: "cause",
    heading: "THE REAL REASON",
    bodyLines: [
      [
        { text: "The " },
        { text: "most important information", highlight: true },
        { text: " is hidden inside " },
        { text: "thousands of pages", highlight: true },
        { text: " of " },
        { text: "company reports", highlight: true },
        { text: "." }
      ],
      [
        { text: "Most people " },
        { text: "never read them", highlight: true },
        { text: "." }
      ],
      [
        { text: "The " },
        { text: "best investors", highlight: true },
        { text: " do." }
      ]
    ]
  },
  {
    id: "result",
    heading: "RESULT",
    bodyLines: [
      [
        { text: "Many rely on " },
        { text: "social media tips", highlight: true },
        { text: " instead of " },
        { text: "facts", highlight: true },
        { text: "." }
      ],
      [
        { text: "Investing becomes a " },
        { text: "gamble", highlight: true },
        { text: " instead of a " },
        { text: "skill", highlight: true },
        { text: "." }
      ]
    ]
  },
  {
    id: "mission",
    heading: "MISSION ASSIGNED",
    bodyLines: [
      [
        { text: "Unlock the same " },
        { text: "documents", highlight: true },
        { text: " the " },
        { text: "best investors", highlight: true },
        { text: " use." }
      ]
    ]
  },
  {
    id: "reward",
    heading: "REWARD",
    bodyLines: [
      [
        { text: "Gain a " },
        { text: "rare skill", highlight: true },
        { text: " that can benefit you for " },
        { text: "life", highlight: true },
        { text: "." }
      ],
      [
        { text: "Become a " },
        { text: "smarter investor", highlight: true },
        { text: " forever." }
      ]
    ]
  }
] as const;

export const MISSION_BRIEF_CARDS_CONTINUE_LABEL = "CONTINUE ▶";
