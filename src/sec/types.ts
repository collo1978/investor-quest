/**
 * SEC Content Layer — runtime types.
 *
 * Shapes for the future pipeline:
 *   SEC Filing → Parser → AI Layer → Quest Generation
 *
 * No fetching/parsing is implemented yet. These types describe the
 * boundary contracts so the rest of the engine can be built against them.
 */

import type { CompanyId } from "@/data/companies";
import type { QuestDefinition, QuestTemplate } from "@/data/quests/types";

export type SecForm = "10-K" | "10-Q" | "8-K" | "DEF 14A" | "S-1" | "13F";

export type SecFilingRef = {
  cik: string;
  companyId: CompanyId;
  accessionNumber: string;
  form: SecForm;
  filedAt: string; // ISO date
  /** Period-of-report (fiscal date). */
  periodOfReport: string | null;
};

export type SecSection = {
  filing: SecFilingRef;
  /** Stable section identifier, e.g. "item-1", "item-1a", "item-7". */
  sectionId: string;
  /** Display name, e.g. "Item 1 — Business". */
  title: string;
  /** Raw extracted text. */
  text: string;
};

export type SecAiSummary = {
  filing: SecFilingRef;
  sectionId: string;
  /** Short markdown summary suitable for in-app rendering. */
  summary: string;
  /** Surfaced bullet points / pull-quotes. */
  highlights: string[];
  /** Model id and prompt version used to produce the summary. */
  meta: { model: string; promptVersion: string; generatedAt: string };
};

/** Result of a single SEC -> quest generation pass. */
export type QuestGenerationResult = {
  template: QuestTemplate;
  /** Concrete quest instantiated for `companyId`. */
  quest: QuestDefinition;
  /** Provenance from the SEC filing(s) used. */
  sources: SecAiSummary[];
};
