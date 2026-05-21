export type ProductCategoryKey = "hardware" | "services" | "ecosystem";

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
  investorInsight: string | null;
  sourceForm: string;
  sourceSectionLabel: string | null;
  sourceAccession?: string | null;
};
