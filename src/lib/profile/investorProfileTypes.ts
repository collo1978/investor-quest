import type { CompanyId } from "@/data/companies";
import type { BadgeId } from "@/engine/progression/badges";
import type {
  BusinessChecklistSectionId,
  ChecklistSectionQuizStatus,
  InvestorRollupRating
} from "@/lib/business/businessInvestorFramework";

export type ProfileSectionRow = {
  id: BusinessChecklistSectionId;
  emoji: string;
  label: string;
  shortLabel: string;
  state: "locked" | "active" | "completed";
  quizStatus: ChecklistSectionQuizStatus;
  overallRating: InvestorRollupRating | null;
};

export type ProfileCompanyView = {
  id: CompanyId;
  name: string;
  ticker: string;
  sector: string;
  started: boolean;
  mastered: boolean;
  masteryPct: number;
  sectionsCompleted: number;
  totalSections: number;
  sections: ProfileSectionRow[];
  overallRating: InvestorRollupRating | null;
};

export type ProfileSectorRow = {
  sector: string;
  masteryPct: number;
  companiesStarted: number;
  companiesMastered: number;
  locked: boolean;
};

export type ProfileQuizResult = {
  sectionId: BusinessChecklistSectionId;
  emoji: string;
  label: string;
  passed: boolean;
  companyTicker: string;
};

export type ProfileAchievement = {
  id: string;
  badgeId?: BadgeId;
  title: string;
  detail: string;
  earned: boolean;
  earnedAt: number | null;
};

export type ProfileStatistics = {
  xpEarned: number;
  evidenceCardsCompleted: number;
  evidenceRatingsSubmitted: number;
  principlesCompleted: number;
  checklistSectionsCompleted: number;
  quizzesPassed: number;
  companiesStarted: number;
  companiesMastered: number;
  questsCompleted: number;
  quizStreak: number;
};

export type InvestorProfileSnapshot = {
  playerName: string;
  initials: string;
  level: number;
  xp: number;
  title: string;
  xpInBand: number;
  xpBandTotal: number;
  xpBandPct: number;
  xpToNextTitle: number;
  nextTitle: string | null;
  activeCompanyId: CompanyId;
  statistics: ProfileStatistics;
  companies: ProfileCompanyView[];
  sectorMastery: ProfileSectorRow[];
  quizResults: ProfileQuizResult[];
  achievements: ProfileAchievement[];
};
