import { preload } from "react-dom";

import {
  BANK_MOBILE_MAP_PATH,
  DESKTOP_MAP_PATH
} from "@/lib/screenAssetUrls";

import MapPageClient from "./MapPageClient";

export default function MapPage() {
  preload(DESKTOP_MAP_PATH, { as: "image" });
  preload(BANK_MOBILE_MAP_PATH, { as: "image" });
  return <MapPageClient />;
}
