/**
 * SEC Content Layer — quest generator (stub).
 *
 * Future hook: given a `QuestTemplate` and AI-summarized SEC sections,
 * produce a fully resolved `QuestDefinition` with description/aiTask
 * filled from the filing. For now this is a stub interface.
 */

import type { CompanyId } from "@/data/companies";
import type { QuestTemplate } from "@/data/quests/types";
import type { QuestGenerationResult, SecAiSummary } from "@/sec/types";

export type SecQuestGenerator = {
  generate: (input: {
    template: QuestTemplate;
    companyId: CompanyId;
    sources: SecAiSummary[];
  }) => Promise<QuestGenerationResult | null>;
};

export const stubQuestGenerator: SecQuestGenerator = {
  async generate() {
    return null;
  }
};
