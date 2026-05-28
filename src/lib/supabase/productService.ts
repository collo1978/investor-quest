import { getDemoProductServiceReport } from "@/lib/productService/demoProductService";
import { normalizeProductServiceReport } from "@/lib/productService/normalizeProductServiceReport";
import type { ProductServiceReport } from "@/lib/productService/types";

/** Product/services report for quest visuals (demo-backed for MVP). */
export async function fetchProductServiceReport(
  ticker: string
): Promise<ProductServiceReport | null> {
  const symbol = ticker.trim().toUpperCase();
  if (!symbol) return null;
  const raw = getDemoProductServiceReport(symbol);
  if (!raw) return null;
  return normalizeProductServiceReport(raw);
}
