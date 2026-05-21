/**
 * Future AI / Enterprise scoring placeholders.
 * TODO: Investor Quality Score — blend quiz accuracy, read depth, return frequency.
 * TODO: Learning Consistency Score — streak + session regularity.
 * TODO: Retention Probability — logistic model on pillar completion + badges.
 * TODO: Conviction Strength Score — conviction updates + repeat company research.
 * TODO: Research Depth Score — cards read / quests started ratio by pillar.
 * TODO: Company Expertise Score — per-ticker completion + quiz performance.
 * TODO: Sector Mastery Score — aggregate by sector tags in metadata.
 *
 * Tier packaging:
 *   basic    — totals + funnel
 *   pro      — retention, time-of-day, heatmaps
 *   enterprise — predictive scores + cohort AI narratives
 */

export type FutureScoreId =
  | "investor_quality"
  | "learning_consistency"
  | "retention_probability"
  | "conviction_strength"
  | "research_depth"
  | "company_expertise"
  | "sector_mastery";

export const FUTURE_SCORE_LABELS: Record<FutureScoreId, string> = {
  investor_quality: "Investor Quality Score",
  learning_consistency: "Learning Consistency Score",
  retention_probability: "Retention Probability",
  conviction_strength: "Conviction Strength Score",
  research_depth: "Research Depth Score",
  company_expertise: "Company Expertise Score",
  sector_mastery: "Sector Mastery Score"
};
