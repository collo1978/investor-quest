/**
 * Nike (NKE), curated quest overrides for player-visible quality fixes.
 */
import type { CompanyContent } from "@/data/quests/content/types";
import { contentKey } from "@/data/quests/content/types";

export const NIKE_CONTENT: CompanyContent = {
  companyId: "nke",
  overrides: {
    [contentKey("management", "mgmt-2")]: {
      cards: {
        "card-2": {
          plainEnglishAnswer:
            "Nike sends cash back to owners two main ways: regular dividends and buying back its own stock on the open market.\n\nThe filing shows billions went back to shareholders over the last year, even when sales were choppy.\n\nWhy investors care:\nBuybacks and dividends are how you actually receive part of the profits as a shareholder."
        }
      }
    }
  }
};