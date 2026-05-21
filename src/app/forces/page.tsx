import { preload } from "react-dom";

import { FORCES_HUB_IMG_SRC } from "@/lib/screenAssetUrls";

import ForcesPageClient from "./ForcesPageClient";

export default function ForcesPage() {
  preload(FORCES_HUB_IMG_SRC, { as: "image" });
  return <ForcesPageClient />;
}
