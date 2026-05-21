"use client";

import { use } from "react";

import { GameHealthMobileFix } from "@/components/platform/GameHealthMobileFix";

export default function MobileFixPage({
  params
}: {
  params: Promise<{ issueId: string }>;
}) {
  const { issueId } = use(params);
  return <GameHealthMobileFix issueId={issueId} />;
}
