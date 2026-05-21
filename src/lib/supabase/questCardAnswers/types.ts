import type { PillarId } from "@/data/pillars";

export type CompanyQuestCardAnswerRow = {
  id: string;
  ticker: string;
  pillar_id: string;
  quest_slug: string;
  card_id: string;
  plain_english_answer: string;
  investor_insight: string | null;
  source_form: string;
  source_accession: string | null;
  source_section_keys: string[];
  filing_section_ids: string[];
  content_hash: string | null;
  generated_at: string;
  updated_at: string;
};

export type StoredQuestCardAnswer = {
  cardId: string;
  plainEnglishAnswer: string;
  investorInsight: string | null;
  sourceAccession: string | null;
  sourceForm: string;
  sourceSectionKeys: string[];
  generatedAt: string;
};

/** @deprecated Use StoredQuestCardAnswer */
export type StoredFinancialCardAnswer = StoredQuestCardAnswer;

export type QuestContentStatus =
  | "ready"
  | "partial"
  | "missing_extract"
  | "needs_generation"
  | "loading";

/** @deprecated Use QuestContentStatus */
export type FinancialQuestContentStatus = QuestContentStatus;

export type PillarQuestAnswersPayload = {
  pillarId: PillarId;
  status: QuestContentStatus;
  questSlug: string;
  ticker: string;
  cards: Record<string, StoredQuestCardAnswer>;
  sourceLabel: string | null;
  expectedCardIds: string[];
};

/** @deprecated Use PillarQuestAnswersPayload */
export type FinancialQuestAnswersPayload = Omit<
  PillarQuestAnswersPayload,
  "pillarId"
> & { pillarId?: PillarId };
