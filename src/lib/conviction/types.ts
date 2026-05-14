export type ConvictionKind = "confident" | "cautious";

export type FilingKind = "10-K" | "10-Q" | "Earnings call";

export type ConvictionRecord = {
  ticker: string;
  island: string;
  filing: FilingKind;
  conviction: ConvictionKind;
  timestamp: number;
};
