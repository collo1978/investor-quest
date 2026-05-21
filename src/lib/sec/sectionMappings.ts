import type { SecFilingFormType } from "@/lib/sec/types";

/** Quest-relevant categories — maps to quest card pillars in the game layer. */
export type QuestSectionCategory =
  | "business"
  | "forces"
  | "financials"
  | "quarterly_update"
  | "quarterly_risks"
  | "quarterly_financials"
  | "proxy_board"
  | "proxy_executives"
  | "proxy_compensation"
  | "proxy_governance"
  | "proxy_ownership";

export type SecSectionMapping = {
  formType: SecFilingFormType;
  questCategory: QuestSectionCategory;
  sectionKey: string;
  sectionLabel: string;
  /** SEC-API.io Extractor `item` code (10-K / 10-Q only). */
  extractorItem?: string;
  pillarHint?: "business" | "forces" | "financials";
};

/** Canonical mapping: which filing sections feed which quest types. */
export const SEC_QUEST_SECTION_MAPPINGS: readonly SecSectionMapping[] = [
  {
    formType: "10-K",
    questCategory: "business",
    sectionKey: "item_1",
    sectionLabel: "Item 1 — Business",
    extractorItem: "1",
    pillarHint: "business"
  },
  {
    formType: "10-K",
    questCategory: "forces",
    sectionKey: "item_1a",
    sectionLabel: "Item 1A — Risk Factors",
    extractorItem: "1A",
    pillarHint: "forces"
  },
  {
    formType: "10-K",
    questCategory: "financials",
    sectionKey: "item_7",
    sectionLabel: "Item 7 — MD&A",
    extractorItem: "7",
    pillarHint: "financials"
  },
  {
    formType: "10-K",
    questCategory: "financials",
    sectionKey: "item_8",
    sectionLabel: "Item 8 — Financial Statements",
    extractorItem: "8",
    pillarHint: "financials"
  },
  {
    formType: "10-Q",
    questCategory: "quarterly_update",
    sectionKey: "part1item2",
    sectionLabel: "Part I Item 2 — MD&A",
    extractorItem: "part1item2",
    pillarHint: "business"
  },
  {
    formType: "10-Q",
    questCategory: "quarterly_risks",
    sectionKey: "part2item1a",
    sectionLabel: "Part II Item 1A — Risk Factors",
    extractorItem: "part2item1a",
    pillarHint: "forces"
  },
  {
    formType: "10-Q",
    questCategory: "quarterly_financials",
    sectionKey: "part1item1",
    sectionLabel: "Part I Item 1 — Financial Statements",
    extractorItem: "part1item1",
    pillarHint: "financials"
  },
  {
    formType: "DEF 14A",
    questCategory: "proxy_board",
    sectionKey: "proxy_board",
    sectionLabel: "Board of Directors",
    pillarHint: "business"
  },
  {
    formType: "DEF 14A",
    questCategory: "proxy_executives",
    sectionKey: "proxy_executives",
    sectionLabel: "Executive Officers",
    pillarHint: "business"
  },
  {
    formType: "DEF 14A",
    questCategory: "proxy_compensation",
    sectionKey: "proxy_compensation",
    sectionLabel: "Executive Compensation",
    pillarHint: "financials"
  },
  {
    formType: "DEF 14A",
    questCategory: "proxy_governance",
    sectionKey: "proxy_governance",
    sectionLabel: "Corporate Governance",
    pillarHint: "forces"
  },
  {
    formType: "DEF 14A",
    questCategory: "proxy_ownership",
    sectionKey: "proxy_ownership",
    sectionLabel: "Security Ownership",
    pillarHint: "financials"
  }
] as const;

export function getSectionMappingsForForm(
  formType: SecFilingFormType
): SecSectionMapping[] {
  return SEC_QUEST_SECTION_MAPPINGS.filter((m) => m.formType === formType);
}
