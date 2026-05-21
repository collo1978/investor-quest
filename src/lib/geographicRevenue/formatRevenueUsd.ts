/** Compact USD for map labels (e.g. $165B). */
export function formatRevenueUsd(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return "";
  if (amount >= 1_000_000_000_000) {
    return `$${(amount / 1_000_000_000_000).toFixed(1)}T`;
  }
  if (amount >= 1_000_000_000) {
    return `$${Math.round(amount / 1_000_000_000)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${Math.round(amount / 1_000_000)}M`;
  }
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}
