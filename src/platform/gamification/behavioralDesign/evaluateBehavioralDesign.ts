import {
  FOGG_FACTORS,
  HOOK_STAGES,
  OCTALYSIS_DRIVES,
  SDT_NEEDS
} from "@/platform/gamification/behavioralDesign/contentCatalog";
import type {
  BehavioralAuditScores,
  BehavioralAuditStatus,
  BehavioralAuditWarning,
  BehavioralDesignAuditReport,
  FoggFrameworkResult,
  HookFrameworkResult,
  OctalysisFrameworkResult,
  SdtFrameworkResult
} from "@/platform/gamification/behavioralDesign/types";

function statusFromScore(score: number): BehavioralAuditStatus {
  if (score >= 75) return "healthy";
  if (score >= 60) return "needs_review";
  if (score >= 45) return "weak";
  return "critical";
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function evaluateOctalysis(scores: BehavioralAuditScores["octalysis"]): OctalysisFrameworkResult {
  const drives = OCTALYSIS_DRIVES.map((d) => ({
    ...d,
    score: scores[d.id],
    status: statusFromScore(scores[d.id])
  }));

  const intrinsicScores = drives
    .filter((d) => d.motivation === "intrinsic")
    .map((d) => d.score);
  const extrinsicScores = drives
    .filter((d) => d.motivation === "extrinsic" || d.motivation === "mixed")
    .map((d) => d.score);
  const whiteScores = drives.filter((d) => d.hat === "white").map((d) => d.score);
  const blackScores = drives.filter((d) => d.hat === "black").map((d) => d.score);
  const leftScores = drives
    .filter((d) => d.brain === "left" || d.brain === "both")
    .map((d) => d.score);
  const rightScores = drives
    .filter((d) => d.brain === "right" || d.brain === "both")
    .map((d) => d.score);

  const intrinsicPercent = avg(intrinsicScores);
  const extrinsicPercent = avg(extrinsicScores);
  const whiteHatPercent = avg(whiteScores);
  const blackHatPercent = avg(blackScores);
  const leftBrainPercent = avg(leftScores);
  const rightBrainPercent = avg(rightScores);

  const overused: string[] = [];
  const underused: string[] = [];
  for (const d of drives) {
    if (d.score >= 80) overused.push(d.label);
    if (d.score < 50) underused.push(d.label);
  }

  const accomplishment = scores.accomplishment;
  const warnings: BehavioralAuditWarning[] = [];
  const suggestions: string[] = [];

  if (accomplishment >= 80 && extrinsicPercent > intrinsicPercent + 15) {
    warnings.push({
      id: "xp_dominant",
      message:
        "XP and accomplishment drives may be dominating — risk of grind over meaningful learning.",
      severity: "needs_review"
    });
    suggestions.push(
      "Add more epic-meaning copy on quest completion and reduce XP-only celebration moments."
    );
  }

  if (blackHatPercent > whiteHatPercent + 10) {
    warnings.push({
      id: "black_hat_high",
      message:
        "Black Hat drives (scarcity, curiosity, loss) score higher than White Hat — may feel pressuring.",
      severity: "needs_review"
    });
    suggestions.push(
      "Balance gates with autonomy: explain why content is locked and offer clear mastery paths."
    );
  }

  if (scores.social < 45) {
    suggestions.push(
      "Social/relatedness is underpowered — plan class challenges or opt-in peer comparison."
    );
  }

  if (scores.epic_meaning < 60) {
    suggestions.push(
      "Strengthen epic meaning on onboarding and profile — tie quests to long-term investor identity."
    );
  }

  const healthPercent = avg(drives.map((d) => d.score));

  return {
    frameworkId: "octalysis",
    label: "Octalysis Framework",
    purpose: "Motivation balance",
    healthPercent,
    status: statusFromScore(healthPercent),
    sourceType: "manual",
    drives,
    balance: {
      intrinsicPercent,
      extrinsicPercent,
      whiteHatPercent,
      blackHatPercent,
      leftBrainPercent,
      rightBrainPercent
    },
    overused,
    underused,
    warnings,
    suggestions,
    presentSummary: [
      "Strong accomplishment loop (XP, levels, badges)",
      "Solid ownership via profile and saved progress",
      "Gating and unlocks provide scarcity",
      "Social layer still mostly planned"
    ]
  };
}

function evaluateHook(scores: BehavioralAuditScores["hook"]): HookFrameworkResult {
  const stages = HOOK_STAGES.map((s) => ({
    ...s,
    healthPercent: scores[s.id],
    status: statusFromScore(scores[s.id])
  }));

  const warnings: BehavioralAuditWarning[] = [];
  const suggestions: string[] = [];

  if (scores.action < 65) {
    warnings.push({
      id: "action_hard",
      message: "Action step may be too hard — users might not complete the core loop.",
      severity: "weak"
    });
  }

  if (scores.trigger < 55) {
    warnings.push({
      id: "trigger_weak",
      message: "Triggers to return are weak — habit loop may not restart reliably.",
      severity: "needs_review"
    });
    suggestions.push("Add streak reminders and 'continue last quest' entry on map/home.");
  }

  if (scores.variable_reward < 60) {
    warnings.push({
      id: "reward_predictable",
      message: "Rewards may feel too predictable — variable reward stage needs more surprise.",
      severity: "needs_review"
    });
    suggestions.push("Introduce occasional surprise insights or bonus unlock moments.");
  }

  if (scores.investment < 60) {
    warnings.push({
      id: "investment_weak",
      message: "User investment in the system is moderate — return likelihood may suffer.",
      severity: "needs_review"
    });
    suggestions.push(
      "Deepen investor armor, conviction history, and visible mastery portfolio on profile."
    );
  }

  const healthPercent = avg(stages.map((s) => s.healthPercent));

  return {
    frameworkId: "hook",
    label: "Hook Model",
    purpose: "Habit formation and retention",
    healthPercent,
    status: statusFromScore(healthPercent),
    sourceType: "manual",
    stages,
    warnings,
    suggestions
  };
}

function evaluateSdt(scores: BehavioralAuditScores["sdt"]): SdtFrameworkResult {
  const needs = SDT_NEEDS.map((n) => ({
    ...n,
    healthPercent: scores[n.id],
    status: statusFromScore(scores[n.id])
  }));

  const warnings: BehavioralAuditWarning[] = [];
  const suggestions: string[] = [];

  if (scores.autonomy < 60) {
    warnings.push({
      id: "autonomy_low",
      message: "System may feel too controlled — autonomy need is under-served.",
      severity: "needs_review"
    });
  }

  if (scores.competence < 65) {
    warnings.push({
      id: "competence_unclear",
      message: "Progress and competence gains may not be clearly explained to beginners.",
      severity: "needs_review"
    });
    suggestions.push("Show 'what you learned' summaries after quizzes and pillar completion.");
  }

  if (scores.relatedness < 45) {
    warnings.push({
      id: "relatedness_weak",
      message: "Relatedness / social layer is weak — intrinsic long-term motivation at risk.",
      severity: "weak"
    });
    suggestions.push("Pilot class challenges or broker cohort goals with privacy-first design.");
  }

  const healthPercent = avg(needs.map((n) => n.healthPercent));

  return {
    frameworkId: "sdt",
    label: "Self-Determination Theory",
    purpose: "Healthy intrinsic learning motivation",
    healthPercent,
    status: statusFromScore(healthPercent),
    sourceType: "manual",
    needs,
    warnings,
    suggestions
  };
}

function evaluateFogg(scores: BehavioralAuditScores["fogg"]): FoggFrameworkResult {
  const factors = FOGG_FACTORS.map((f) => ({
    ...f,
    healthPercent: scores[f.id],
    status: statusFromScore(scores[f.id])
  }));

  const warnings: BehavioralAuditWarning[] = [];
  const suggestions: string[] = [];

  if (scores.ability < 65) {
    warnings.push({
      id: "ability_friction",
      message: "Ability/simplicity may be insufficient — quests could feel too complex.",
      severity: "needs_review"
    });
    suggestions.push("Reduce steps to first quiz; add guided mode for first session.");
  }

  if (scores.prompt < 60) {
    warnings.push({
      id: "prompt_unclear",
      message: "Prompts may be unclear — users might not know what to do next.",
      severity: "needs_review"
    });
    suggestions.push("Add persistent 'Next best quest' CTA on map and after card reads.");
  }

  if (scores.motivation < 55) {
    warnings.push({
      id: "motivation_low",
      message: "Motivation may be low for returning beginners.",
      severity: "weak"
    });
  }

  const healthPercent = avg(factors.map((f) => f.healthPercent));

  return {
    frameworkId: "fogg",
    label: "Fogg Behavior Model",
    purpose: "Simplicity, friction, and onboarding ease",
    healthPercent,
    status: statusFromScore(healthPercent),
    sourceType: "manual",
    factors,
    warnings,
    suggestions
  };
}

export function evaluateBehavioralDesign(
  scores: BehavioralAuditScores
): BehavioralDesignAuditReport {
  const octalysis = evaluateOctalysis(scores.octalysis);
  const hook = evaluateHook(scores.hook);
  const sdt = evaluateSdt(scores.sdt);
  const fogg = evaluateFogg(scores.fogg);

  const overallHealthPercent = avg([
    octalysis.healthPercent,
    hook.healthPercent,
    sdt.healthPercent,
    fogg.healthPercent
  ]);

  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    sourceType: "manual",
    overallHealthPercent,
    overallStatus: statusFromScore(overallHealthPercent),
    octalysis,
    hook,
    sdt,
    fogg
  };
}
