import { preload } from "react-dom";

import { BUSINESS_HUB_IMG_SRC } from "@/lib/screenAssetUrls";

import BusinessPageClient from "./BusinessPageClient";

type PageProps = {
  searchParams: Promise<{ dev?: string }>;
};

export default async function BusinessPage({ searchParams }: PageProps) {
  const { dev } = await searchParams;
  preload(BUSINESS_HUB_IMG_SRC, { as: "image" });
  return <BusinessPageClient showDevPanel={dev === "1"} />;
}
