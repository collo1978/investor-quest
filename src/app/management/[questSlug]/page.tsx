import ManagementQuestRouteClient from "./ManagementQuestRouteClient";

export default async function ManagementQuestPage({
  params
}: {
  params: Promise<{ questSlug: string }>;
}) {
  const { questSlug } = await params;
  return <ManagementQuestRouteClient slug={questSlug} />;
}
