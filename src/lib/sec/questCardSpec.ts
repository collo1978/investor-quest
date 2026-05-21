import type { SecFilingFormType } from "@/lib/sec/types";

/** One generated answer target: quest slug + card + filing sections + prompt focus. */
export type QuestCardSpec = {
  questSlug: string;
  cardId: string;
  formType: SecFilingFormType;
  sectionKeys: readonly string[];
  /** Card-specific instruction appended to the quest-level aiTask. */
  promptFocus: string;
};
