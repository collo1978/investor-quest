import { preload } from "react-dom";

import {
  SCHOOLS_MAP_IMAGE_SRC
} from "@/lib/schools/schoolsMapConfig";

import SchoolsMapPageClient from "./SchoolsMapPageClient";

/**
 * Schools map — dedicated art + corner description panels.
 * Bank/broker and `/map` continue to use `QuestMapScene` + `desktop-map.png`.
 */
export default function SchoolsMapPage() {
  preload(SCHOOLS_MAP_IMAGE_SRC, { as: "image" });
  return <SchoolsMapPageClient />;
}
