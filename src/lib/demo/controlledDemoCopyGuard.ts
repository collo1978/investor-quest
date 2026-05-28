import { collectGlobalAvoidPhrases } from "@/data/contentRules";
import {
  CONTROLLED_DEMO_COMPANY_ID,
  CONTROLLED_DEMO_MODE
} from "@/lib/demo/controlledDemo";
import type { CompanyId } from "@/data/companies";

/** Editorial avoid list from adaptive learning rules (see investorQuestContentRules.ts). */
const RULE_AVOID_SNIPPETS = collectGlobalAvoidPhrases();

/** Patterns that make the investor demo feel broken or incomplete. */
const WEAK_DEMO_ANSWER_PATTERNS: readonly RegExp[] = [
  /not disclosed/i,
  /were not disclosed/i,
  /was not disclosed/i,
  /not available in (?:this|the) filing/i,
  /unavailable in (?:this|the) filing/i,
  /missing_extract/i,
  /filing did not/i,
  /did not provide/i,
  /does not disclose/i,
  /no (?:specific |detailed )?regional/i,
  /regional revenue details were not/i,
  /insufficient(?:ly)? disclosed/i,
  /data (?:is|are) (?:not|un)available/i,
  /placeholder until generated/i,
  /awaiting content/i,
  /still missing after the pull/i,
  /answer generation incomplete/i
];

export function isControlledDemoCompany(companyId: CompanyId): boolean {
  return CONTROLLED_DEMO_MODE && companyId === CONTROLLED_DEMO_COMPANY_ID;
}

export function isWeakDemoAnswer(text: string | null | undefined): boolean {
  const t = text?.trim();
  if (!t) return true;
  if (WEAK_DEMO_ANSWER_PATTERNS.some((re) => re.test(t))) return true;
  const lower = t.toLowerCase();
  return RULE_AVOID_SNIPPETS.some((phrase) => lower.includes(phrase.toLowerCase()));
}
