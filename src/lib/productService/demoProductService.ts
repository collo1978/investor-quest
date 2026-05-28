import type { ProductServiceReport } from "@/lib/productService/types";
import { normalizeProductServiceReport } from "@/lib/productService/normalizeProductServiceReport";

/** Demo product & services mix for Apple (10-K–style buckets). */
const APPLE_DEMO_RAW: ProductServiceReport = {
  ticker: "AAPL",
  fiscalYear: 2024,
  headline: "Most money still comes from iPhone, with Services adding recurring revenue on top",
  revenueMix: [
    { label: "iPhone", percent: 52 },
    { label: "Services", percent: 22 },
    { label: "Wearables", percent: 10 },
    { label: "Mac", percent: 8 },
    { label: "iPad", percent: 8 }
  ],
  categories: [
    {
      categoryKey: "hardware",
      label: "Hardware",
      items: [
        {
          productKey: "iphone",
          label: "iPhone",
          category: "hardware",
          percent: 52,
          isPrimary: true
        },
        {
          productKey: "mac",
          label: "Mac",
          category: "hardware",
          percent: 8
        },
        {
          productKey: "ipad",
          label: "iPad",
          category: "hardware",
          percent: 8
        },
        {
          productKey: "apple_watch",
          label: "Apple Watch",
          category: "hardware"
        },
        {
          productKey: "airpods",
          label: "AirPods",
          category: "hardware"
        }
      ]
    },
    {
      categoryKey: "services",
      label: "Services",
      items: [
        {
          productKey: "app_store",
          label: "App Store",
          category: "services",
          recurring: true
        },
        {
          productKey: "icloud",
          label: "iCloud",
          category: "services",
          recurring: true
        },
        {
          productKey: "apple_music",
          label: "Apple Music",
          category: "services",
          recurring: true
        },
        {
          productKey: "apple_tv",
          label: "Apple TV+",
          category: "services",
          recurring: true
        },
        {
          productKey: "applecare",
          label: "AppleCare",
          category: "services",
          recurring: true
        }
      ]
    }
  ],
  sourceForm: "10-K",
  sourceSectionLabel: "Products and Services",
  sourceAccession: null
};

export const APPLE_DEMO_PRODUCT_SERVICE =
  normalizeProductServiceReport(APPLE_DEMO_RAW);

export function getDemoProductServiceReport(
  ticker: string
): ProductServiceReport | null {
  const symbol = ticker.trim().toUpperCase();
  if (symbol === "AAPL") return APPLE_DEMO_PRODUCT_SERVICE;
  return null;
}
