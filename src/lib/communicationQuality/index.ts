export type {
  CommunicationCategoryId,
  CommunicationCategoryResult,
  CommunicationContentAudit,
  CommunicationContentKind,
  CommunicationPhraseHit,
  CommunicationPillarScore,
  CommunicationQualityReport,
  CommunicationRegenerationTarget,
  CommunicationSeverity,
  CommunicationWarning
} from "@/lib/communicationQuality/types";

export {
  COMMUNICATION_CATEGORY_DEFS,
  COMMUNICATION_OVERALL_CHECK_ID,
  categoryLabel,
  scoreToHealthStatus,
  warningMessage
} from "@/lib/communicationQuality/categoryLabels";

export { auditCommunicationText } from "@/lib/communicationQuality/auditText";
export {
  communicationChecksFromReport,
  communicationIssueDraftsFromReport,
  runCommunicationQualityAudit
} from "@/lib/communicationQuality/runCommunicationAudit";
