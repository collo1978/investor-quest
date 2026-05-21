import { preload } from "react-dom";

import { QUEST_MAP_PATH } from "@/lib/screenAssetUrls";

import MapPageClient from "./MapPageClient";

export default function MapPage() {
  preload(QUEST_MAP_PATH, { as: "image" });
  return <MapPageClient />;
}
