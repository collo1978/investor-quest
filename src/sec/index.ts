/**
 * SEC Content Layer — public API (stubs only).
 *
 * Pipeline: SEC Filing → Parser → AI Summarizer → Quest Generator → Quest
 *
 * No real fetching/parsing/AI yet; this layer exists so the rest of the
 * engine can be wired to swap in concrete implementations later without
 * touching the data, engine, or UI layers.
 */

export type {
  SecForm,
  SecFilingRef,
  SecSection,
  SecAiSummary,
  QuestGenerationResult
} from "@/sec/types";

export { stubSecFetcher, type SecFetcher } from "@/sec/fetcher";
export { stubSecParser, type SecParser } from "@/sec/parser";
export {
  stubSecAiSummarizer,
  type SecAiSummarizer
} from "@/sec/ai-summarizer";
export {
  stubQuestGenerator,
  type SecQuestGenerator
} from "@/sec/quest-generator";

/**
 * Default pipeline composition (all stubs). Swap each member for a real
 * implementation when SEC ingestion is wired up.
 */
import { stubSecFetcher } from "@/sec/fetcher";
import { stubSecParser } from "@/sec/parser";
import { stubSecAiSummarizer } from "@/sec/ai-summarizer";
import { stubQuestGenerator } from "@/sec/quest-generator";

export const secPipeline = {
  fetcher: stubSecFetcher,
  parser: stubSecParser,
  summarizer: stubSecAiSummarizer,
  generator: stubQuestGenerator
} as const;
