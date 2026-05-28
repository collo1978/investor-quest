import { categoryLabel } from "@/lib/communicationQuality/categoryLabels";
import {
  extractFlaggedSentence,
  type AuditFlaggedFinding
} from "@/lib/gameHealth/resolutionIntelligence/actionableDetail";
import type { CommunicationWarning } from "@/lib/communicationQuality/types";

import { reasonForWarningCode, rewriteDirectionForCode } from "./rewriteDirections";

export function buildFlaggedFindingsFromWarnings(
  warnings: CommunicationWarning[],
  fullText: string,
  max = 5
): AuditFlaggedFinding[] {
  return warnings.slice(0, max).map((w) => ({
    code: w.code,
    categoryId: w.categoryId,
    categoryLabel: categoryLabel(w.categoryId),
    reason: reasonForWarningCode(w.code, w.message),
    flaggedText: extractFlaggedSentence(fullText, w.snippet),
    rewriteDirection: rewriteDirectionForCode(w.code, w.categoryId),
    severity: w.severity
  }));
}
