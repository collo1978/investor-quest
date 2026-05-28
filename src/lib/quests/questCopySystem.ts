/**
 * Global quest copy system — public exports.
 */

export {
  GLOBAL_BANNED_PHRASE_PATTERNS,
  QUEST_COPY_GLOBAL_RULES_TEXT,
  QUEST_COPY_LIMITS,
  scanBannedPhrases,
  hasBannedCopySection
} from "@/lib/quests/questCopyRules";

export {
  formatPlayerCopy,
  formatQuestCardCopy,
  formatQuestCardFields
} from "@/lib/quests/questAnswerFormatter";

export {
  validateQuestCopy,
  suggestCleanedQuestCopy,
  validateAndCleanQuestCopy,
  type QuestCopyValidationResult,
  type QuestCopyIssue
} from "@/lib/quests/questAnswerValidator";

export { runCopyQualityAudit, type CopyQualityAuditReport } from "@/lib/quests/runCopyQualityAudit";
