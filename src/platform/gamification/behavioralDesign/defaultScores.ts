import type { BehavioralAuditScores } from "@/platform/gamification/behavioralDesign/types";

/** Default manual audit scores (0–100). Editable in admin UI; persisted locally until analytics API. */
export const DEFAULT_BEHAVIORAL_AUDIT_SCORES: BehavioralAuditScores = {
  octalysis: {
    epic_meaning: 78,
    accomplishment: 82,
    empowerment: 72,
    ownership: 76,
    social: 38,
    scarcity: 70,
    unpredictability: 55,
    loss_avoidance: 48
  },
  hook: {
    trigger: 52,
    action: 80,
    variable_reward: 68,
    investment: 74
  },
  sdt: {
    autonomy: 75,
    competence: 80,
    relatedness: 35
  },
  fogg: {
    motivation: 72,
    ability: 78,
    prompt: 65
  }
};

export const BEHAVIORAL_AUDIT_STORAGE_KEY = "investor-quest::behavioral-design-audit-scores";
