"use client";

import dynamic from "next/dynamic";

import type { QuestDetailScreenProps } from "@/components/QuestDetailScreen";
import { QuestRouteLoading } from "@/components/quest/QuestRouteLoading";

export const DynamicQuestDetailScreen = dynamic<QuestDetailScreenProps>(
  () =>
    import("@/components/QuestDetailScreen").then((mod) => ({
      default: mod.QuestDetailScreen
    })),
  { loading: () => <QuestRouteLoading /> }
);
