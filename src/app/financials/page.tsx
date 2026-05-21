import { preload } from "react-dom";

import { FINANCIAL_HUB_IMG_SRC } from "@/lib/screenAssetUrls";

import FinancialsPageClient from "./FinancialsPageClient";

export default function FinancialsPage() {
  preload(FINANCIAL_HUB_IMG_SRC, { as: "image" });
  return <FinancialsPageClient />;
}
