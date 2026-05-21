import { preload } from "react-dom";

import { MANAGEMENT_HUB_IMG_SRC } from "@/lib/screenAssetUrls";

import ManagementPageClient from "./ManagementPageClient";

export default function ManagementPage() {
  preload(MANAGEMENT_HUB_IMG_SRC, { as: "image" });
  return <ManagementPageClient />;
}
