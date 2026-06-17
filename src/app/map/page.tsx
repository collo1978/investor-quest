import { preload } from "react-dom";

import { DESKTOP_MAP_PATH } from "@/lib/screenAssetUrls";

import MapPageClient from "./MapPageClient";

export default function MapPage() {
  preload(DESKTOP_MAP_PATH, { as: "image" });
  return <MapPageClient />;
}
