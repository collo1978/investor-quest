import type { BehavioralDesignAuditReport } from "@/platform/gamification/behavioralDesign/types";
import type {
  BehavioralAnalyticsSnapshot,
  BehaviorStoryBlock,
  BehaviorStoryEvidence,
  BehaviorStoryReport,
  BehaviorStorySummary,
  BehaviorStorySummaryItem,
  PlayerJourneyStage
} from "@/platform/gamification/behavioralDesign/analytics/types";

function evidence(
  items: Array<{ kind: BehaviorStoryEvidence["kind"]; label: string; detail?: string }>
): BehaviorStoryEvidence[] {
  return items.map((i) => ({ kind: i.kind, label: i.label, detail: i.detail }));
}

type StorySignals = {
  accomplishment: number;
  socialWeak: boolean;
  extrinsicHeavy: boolean;
  blackHatDominant: boolean;
  retentionWeak: boolean;
  onboardingStrong: boolean;
  pillarWeak: boolean;
  competenceStrong: boolean;
  financialsHard: boolean;
  promptWeak: boolean;
  d7: number | null;
  onboarding: number | null;
  hookHealth: number;
  sdtHealth: number;
  foggHealth: number;
};

function readSignals(
  audit: BehavioralDesignAuditReport,
  analytics: BehavioralAnalyticsSnapshot | null
): StorySignals {
  const { octalysis, hook, sdt, fogg } = audit;
  const metric = (id: string) =>
    analytics?.metrics.find((m) => m.metricId === id)?.value ?? null;

  const accomplishment =
    octalysis.drives.find((d) => d.id === "accomplishment")?.score ?? 0;
  const social = octalysis.drives.find((d) => d.id === "social")?.score ?? 0;
  const onboarding = metric("onboarding_completion_rate");
  const pillar = metric("pillar_completion_rate");
  const d7 = metric("d7_retention");
  const financialsFriction = metric("financials_quest_friction_index");

  return {
    accomplishment,
    socialWeak: social < 50,
    extrinsicHeavy:
      octalysis.balance.extrinsicPercent > octalysis.balance.intrinsicPercent + 12,
    blackHatDominant:
      octalysis.balance.blackHatPercent > octalysis.balance.whiteHatPercent + 8,
    retentionWeak:
      (d7 != null && d7 < 0.32) ||
      (hook.stages.find((s) => s.id === "investment")?.healthPercent ?? 100) < 60 ||
      hook.healthPercent < 70,
    onboardingStrong:
      (onboarding != null && onboarding >= 0.65) ||
      (hook.stages.find((s) => s.id === "trigger")?.healthPercent ?? 0) >= 65,
    pillarWeak: pillar != null && pillar < 0.3,
    competenceStrong: (sdt.needs.find((n) => n.id === "competence")?.healthPercent ?? 0) >= 65,
    financialsHard:
      financialsFriction != null && financialsFriction >= 55 ||
      (fogg.factors.find((f) => f.id === "ability")?.healthPercent ?? 100) < 70,
    promptWeak: (fogg.factors.find((f) => f.id === "prompt")?.healthPercent ?? 100) < 60,
    d7,
    onboarding,
    hookHealth: hook.healthPercent,
    sdtHealth: sdt.healthPercent,
    foggHealth: fogg.healthPercent
  };
}

function buildSummary(s: StorySignals): BehaviorStorySummary {
  const whatsWorking: BehaviorStorySummaryItem[] = [];

  if (s.accomplishment >= 65) {
    whatsWorking.push({
      id: "progress",
      label: "Strong progress feeling",
      description:
        "People clearly enjoy moving forward. XP, badges, and levels give a satisfying sense of achievement as they explore companies and complete quests.",
      visual: "progress"
    });
  }

  if (s.onboardingStrong) {
    whatsWorking.push({
      id: "onboarding",
      label: "Engaging first experience",
      description:
        "New users tend to get started with confidence. Early quests and onboarding set a positive tone and help people understand what to do next.",
      visual: "onboarding"
    });
  }

  if (s.competenceStrong || s.sdtHealth >= 70) {
    whatsWorking.push({
      id: "learning",
      label: "Approachable learning",
      description:
        "The experience feels educational, not overwhelming. Quizzes and quest flow help people feel they are actually learning—not just clicking through.",
      visual: "learning"
    });
  }

  if (!s.pillarWeak || s.accomplishment >= 70) {
    whatsWorking.push({
      id: "curiosity",
      label: "Curiosity and momentum",
      description:
        "The map and company exploration invite discovery. Many users want to keep exploring once they have had a few early wins.",
      visual: "curiosity"
    });
  }

  if (whatsWorking.length === 0) {
    whatsWorking.push({
      id: "foundation",
      label: "Solid foundation to build on",
      description:
        "Core quest and progression systems are in place. With a few targeted improvements, the player experience can feel much more rewarding.",
      visual: "progress"
    });
  }

  const needsAttention: BehaviorStorySummaryItem[] = [];

  if (s.retentionWeak || s.pillarWeak) {
    needsAttention.push({
      id: "retention-drop",
      label: "Motivation drops later",
      description:
        "Many users start strong, but energy fades after the first major section. The early excitement works—long-term reasons to return still need strengthening.",
      visual: "retention"
    });
  }

  if (s.socialWeak) {
    needsAttention.push({
      id: "social",
      label: "Community feels thin",
      description:
        "Most of the experience is solo today. Classrooms, cohorts, and brokers may miss peer energy until social features feel more present.",
      visual: "social"
    });
  }

  if (s.extrinsicHeavy) {
    needsAttention.push({
      id: "rewards",
      label: "Very reward-focused",
      description:
        "Points and unlocks do a lot of the motivating work. That can boost short-term activity, but deep interest in investing may need more nurturing over time.",
      visual: "rewards"
    });
  }

  if (s.financialsHard || s.promptWeak) {
    needsAttention.push({
      id: "friction",
      label: "Some parts feel harder than they should",
      description:
        "Financials quests and unclear next steps may slow people down. A few users may stall before they feel their first real win.",
      visual: "friction"
    });
  }

  if (s.blackHatDominant) {
    needsAttention.push({
      id: "pressure",
      label: "Pressure mechanics stand out",
      description:
        "Streaks, gates, and “don’t lose progress” cues may feel intense for some learners—especially in regulated education settings.",
      visual: "trust"
    });
  }

  if (needsAttention.length === 0) {
    needsAttention.push({
      id: "maintain",
      label: "Keep watching real cohorts",
      description:
        "Nothing critical flagged in manual review. Connect live analytics to confirm patterns with real students and clients.",
      visual: "habit"
    });
  }

  let biggestOpportunity = {
    title: "Help people see themselves as investors",
    description:
      "Deepen profile, conviction history, and “your journey so far” so returning feels personal—not just another quest on the map.",
    actionHint: "Show progress portfolio on profile and after each pillar."
  };

  if (s.retentionWeak || s.pillarWeak) {
    biggestOpportunity = {
      title: "Turn early wins into a habit",
      description:
        "The biggest gap is week-two return: remind people where they left off, celebrate small milestones, and make the next quest obvious.",
      actionHint: "Continue-last-quest entry, streak nudges, and post-pillar celebration moments."
    };
  } else if (s.socialWeak) {
    biggestOpportunity = {
      title: "Add healthy social proof",
      description:
        "Optional class or cohort goals could lift engagement for schools and brokers without turning the product into a competition.",
      actionHint: "Pilot privacy-first cohort challenges or shared milestones."
    };
  } else if (s.financialsHard) {
    biggestOpportunity = {
      title: "Make financials feel winnable",
      description:
        "Guided first sessions and simpler paths through financials quests could prevent drop-off right when learning gets serious.",
      actionHint: "Guided mode and clearer “next best quest” after card reads."
    };
  } else if (s.extrinsicHeavy) {
    biggestOpportunity = {
      title: "Balance rewards with meaning",
      description:
        "Pair XP moments with “why this matters for your investing future” so motivation stays tied to learning—not only points.",
      actionHint: "Epic-meaning copy on completion and investor identity on profile."
    };
  }

  const playerJourney: PlayerJourneyStage[] = [
    {
      id: "discover",
      label: "Discovers",
      mood: s.onboardingStrong ? "high" : "medium",
      caption: s.onboardingStrong
        ? "First visit feels welcoming"
        : "Some new users need a clearer start"
    },
    {
      id: "early-wins",
      label: "Early wins",
      mood: s.accomplishment >= 70 ? "high" : "medium",
      caption: "First quests and XP feel rewarding"
    },
    {
      id: "first-section",
      label: "First major section",
      mood: s.pillarWeak ? "medium" : "high",
      caption: s.pillarWeak
        ? "Energy often dips here"
        : "Momentum usually holds"
    },
    {
      id: "return",
      label: "Comes back",
      mood: s.retentionWeak ? "low" : s.d7 != null && s.d7 >= 0.3 ? "rising" : "medium",
      caption: s.retentionWeak
        ? "Fewer people return the next week"
        : "Return visits are improving"
    },
    {
      id: "mastery",
      label: "Builds mastery",
      mood: s.competenceStrong && !s.retentionWeak ? "rising" : "medium",
      caption: "Long-term confidence in investing skills"
    }
  ];

  const oneLine = s.retentionWeak
    ? "People like how Investor Quest starts—but too many drift away before the journey feels like theirs."
    : s.socialWeak
      ? "Investor Quest is strong for solo progress; the next leap is helping people feel part of something bigger."
      : "Investor Quest is giving users a satisfying path forward—with room to make the long journey stick.";

  return {
    oneLine,
    whatsWorking,
    needsAttention,
    biggestOpportunity,
    playerJourney
  };
}

function buildBlocks(
  audit: BehavioralDesignAuditReport,
  s: StorySignals
): BehaviorStoryBlock[] {
  const blocks: BehaviorStoryBlock[] = [];

  blocks.push({
    id: "progress-story",
    title: "People enjoy the feeling of progress",
    narrative:
      s.accomplishment >= 75
        ? `People clearly enjoy progressing through Investor Quest. The XP, badges, and level system give users a strong feeling of progress and achievement. ${
            s.socialWeak
              ? "What is missing for many is a sense of learning together—most momentum today is individual."
              : "That progress feeling is one of the product's clearest strengths."
          } ${
            s.extrinsicHeavy
              ? "A watch-out: rewards do a lot of the heavy lifting. Over time, pair points with personal meaning so interest in investing—not only XP—stays central."
              : ""
          }`.trim()
        : `Progress systems are present but could feel more visible. Stronger celebration of milestones and "what you unlocked" may help users feel momentum sooner.`,
    tone: s.extrinsicHeavy ? "insight" : "strength",
    frameworks: ["octalysis"],
    evidence: evidence([
      { kind: "pattern", label: "Progress & achievement", detail: "XP, levels, badges" }
    ]),
    audiences: ["internal", "broker", "program"]
  });

  if (s.retentionWeak || s.pillarWeak) {
    blocks.push({
      id: "retention-story",
      title: "Strong starts, softer long-term pull",
      narrative:
        s.onboardingStrong && s.pillarWeak
          ? `Many users start strong, but motivation drops after the first major section. Early excitement is working—the long-term journey still needs stronger reasons to continue. Help people see what they have built (profile, convictions, mastery) and make the next visit feel obvious.`
          : `Return visits are the main growth lever right now. Clear reminders, streaks that feel supportive (not punishing), and "pick up where you left off" can turn a good first week into a habit.`,
      tone: "risk",
      frameworks: ["hook"],
      evidence: evidence([
        ...(s.onboarding != null
          ? [{ kind: "metric" as const, label: "Started onboarding", detail: `${Math.round(s.onboarding * 100)}%` }]
          : []),
        ...(s.d7 != null
          ? [{ kind: "metric" as const, label: "Still active after 7 days", detail: `${Math.round(s.d7 * 100)}%` }]
          : [])
      ]),
      audiences: ["internal", "school", "program"]
    });
  }

  blocks.push({
    id: "learning-story",
    title: "Learning feels real—not just gamified",
    narrative:
      s.competenceStrong
        ? `Users can build genuine confidence. Quizzes and quest structure support "I understand this company better now"—not only "I earned points." Keep reinforcing what was learned after each win.`
        : `The educational intent is there, but users may not always feel smarter after a session. Short "what you learned" moments after quizzes could make competence visible.`,
    tone: "strength",
    frameworks: ["sdt"],
    evidence: evidence([{ kind: "pattern", label: "Competence & clarity" }]),
    audiences: ["internal", "school"]
  });

  if (s.financialsHard) {
    blocks.push({
      id: "friction-story",
      title: "Financials can feel like a wall",
      narrative:
        `Some learners hit a speed bump in financials quests—content may feel dense or the next step unclear. That is a common drop-off point. A guided first pass and a single obvious "do this next" button can keep people moving without dumbing down the material.`,
      tone: "risk",
      frameworks: ["fogg"],
      evidence: evidence([{ kind: "pattern", label: "Financials & next-step clarity" }]),
      audiences: ["internal", "broker", "bank"]
    });
  }

  if (s.blackHatDominant) {
    blocks.push({
      id: "trust-story",
      title: "Balance urgency with trust",
      narrative:
        `Streaks, locked content, and "don't break your run" messages can motivate—but also stress some users. For schools and banks, lead with mastery and transparency; use pressure mechanics lightly.`,
      tone: "insight",
      frameworks: ["octalysis"],
      evidence: evidence([{ kind: "pattern", label: "Pressure vs encouragement" }]),
      audiences: ["internal", "bank", "program"]
    });
  }

  return blocks;
}

export function generateBehaviorStory(
  audit: BehavioralDesignAuditReport,
  analytics: BehavioralAnalyticsSnapshot | null
): BehaviorStoryReport {
  const s = readSignals(audit, analytics);
  const summary = buildSummary(s);
  const blocks = buildBlocks(audit, s);
  const confidence = analytics ? "blended" : "manual";

  const headline = summary.oneLine;

  const executiveSummary = [
    summary.whatsWorking[0]?.description.split(".")[0] + ".",
    summary.needsAttention[0]?.description.split(".")[0] + ".",
    `Best next focus: ${summary.biggestOpportunity.title.toLowerCase()}.`
  ]
    .filter((line) => line.length > 1)
    .join(" ");

  const clientTakeaways = [
    summary.whatsWorking[0]?.label
      ? `Working well: ${summary.whatsWorking[0].label.toLowerCase()}.`
      : "Strong progression for investor education programs.",
    summary.needsAttention[0]?.label
      ? `Watch: ${summary.needsAttention[0].label.toLowerCase()}.`
      : "Validate patterns with live cohort data.",
    summary.biggestOpportunity.title + " — " + summary.biggestOpportunity.actionHint,
    s.financialsHard
      ? "Offer a guided path through financials for first-time learners."
      : "Friction is manageable; keep monitoring drop-off by quest type."
  ];

  return {
    version: 2,
    generatedAt: new Date().toISOString(),
    confidence,
    headline,
    executiveSummary,
    summary,
    blocks,
    clientTakeaways
  };
}
