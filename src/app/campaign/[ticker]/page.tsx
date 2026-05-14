import { CampaignLaunchClient } from "./CampaignLaunchClient";

export const dynamic = "force-dynamic";

export default async function CampaignLaunchPage({
  params
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  return <CampaignLaunchClient ticker={ticker} />;
}
