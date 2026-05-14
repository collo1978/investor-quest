/**
 * SEC Content Layer — AI summarizer (stub).
 *
 * Future hook for an LLM-backed summary of an SEC section. Stub only.
 */

import type { SecAiSummary, SecSection } from "@/sec/types";

export type SecAiSummarizer = {
  summarize: (section: SecSection) => Promise<SecAiSummary>;
};

export const stubSecAiSummarizer: SecAiSummarizer = {
  async summarize(section) {
    return {
      filing: section.filing,
      sectionId: section.sectionId,
      summary: "",
      highlights: [],
      meta: {
        model: "stub",
        promptVersion: "0",
        generatedAt: new Date().toISOString()
      }
    };
  }
};
