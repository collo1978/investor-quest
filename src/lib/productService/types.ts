/** Segment bucket key — hardware, services, or company-specific labels. */
export type ProductCategoryKey = string;

export type ProductLineItem = {
  productKey: string;
  label: string;
  category: ProductCategoryKey;
  percent?: number | null;
  revenueUsd?: number | null;
  /** Recurring revenue stream (e.g. subscriptions, App Store). */
  recurring?: boolean;
  /** Optional logo/photo URL when available in CMS or filings. */
  imageUrl?: string | null;
  /** Short highlight, e.g. "Flagship" or "Fastest growing". */
  tag?: string | null;
  isPrimary?: boolean;
};

export type ProductCategoryGroup = {
  categoryKey: ProductCategoryKey;
  label: string;
  items: ProductLineItem[];
};

export type ProductRevenueMixItem = {
  label: string;
  percent: number;
};

export type ProductServiceReport = {
  ticker: string;
  fiscalYear: number;
  headline: string | null;
  /** Top-line revenue mix for the summary bar (optional). */
  revenueMix?: ProductRevenueMixItem[];
  categories: ProductCategoryGroup[];
  /** Legacy pipeline field — not shown in the player UI. */
  investorInsight?: string | null;
  /** Legacy pipeline field — not shown in the player UI. */
  howToReadThis?: string | null;
  sourceForm: string;
  sourceSectionLabel: string | null;
  sourceAccession?: string | null;
};
