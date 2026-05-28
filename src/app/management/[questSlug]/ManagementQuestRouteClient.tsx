"use client";

import { DemoQuestGate } from "@/components/demo/DemoQuestGate";

type Props = {
  slug: string;
};

export default function ManagementQuestRouteClient({ slug }: Props) {
  return <DemoQuestGate pillarId="management" slug={slug} />;
}
