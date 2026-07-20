import { preload } from "react-dom";

import { SCHOOLS_MISSION_BRIEF_IMG_SRC } from "@/lib/schools/schoolsMapConfig";
import { BUSINESS_HUB_IMG_SRC } from "@/lib/screenAssetUrls";

import BusinessPageClient from "./BusinessPageClient";

type PageProps = {
  searchParams?: Promise<{ dev?: string }>;
};

export default async function BusinessPage({ searchParams }: PageProps) {
  const { dev } = (await searchParams) ?? {};
  preload(BUSINESS_HUB_IMG_SRC, { as: "image" });
  preload(SCHOOLS_MISSION_BRIEF_IMG_SRC, { as: "image" });
  const showDevPanel = dev === "1" && process.env.NODE_ENV !== "production";
  return <BusinessPageClient showDevPanel={showDevPanel} />;
}
