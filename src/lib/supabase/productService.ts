import { getDemoProductServiceReport } from "@/lib/productService/demoProductService";
import type { ProductServiceReport } from "@/lib/productService/types";

/** Product/services report for quest visuals (demo-backed for MVP). */
export async function fetchProductServiceReport(
  ticker: string
): Promise<ProductServiceReport | null> {
  const symbol = ticker.trim().toUpperCase();
  if (!symbol) return null;
  return getDemoProductServiceReport(symbol);
}
