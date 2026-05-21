import type { ProductServiceReport } from "@/lib/productService/types";

/** Demo product & services mix for Apple (10-K–style buckets). */
export const APPLE_DEMO_PRODUCT_SERVICE: ProductServiceReport = {
  ticker: "AAPL",
  fiscalYear: 2024,
  headline: "Premium devices plus a growing services ecosystem",
  revenueMix: [
    { label: "iPhone", percent: 52 },
    { label: "Services", percent: 22 },
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
          isPrimary: true,
          tag: "Largest revenue driver"
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
    },
    {
      categoryKey: "ecosystem",
      label: "Ecosystem",
      items: [
        {
          productKey: "ecosystem",
          label: "Device + software lock-in",
          category: "ecosystem",
          tag: "Cross-sell & retention"
        }
      ]
    }
  ],
  investorInsight:
    "Apple sells premium hardware, then layers recurring services on top of a massive installed base — diversifying away from pure iPhone cycles over time.",
  sourceForm: "10-K",
  sourceSectionLabel: "Products and Services",
  sourceAccession: null
};

export function getDemoProductServiceReport(
  ticker: string
): ProductServiceReport | null {
  const symbol = ticker.trim().toUpperCase();
  if (symbol === "AAPL") return APPLE_DEMO_PRODUCT_SERVICE;
  return null;
}
