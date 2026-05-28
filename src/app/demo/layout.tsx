import type { Metadata } from "next";

import { DemoProductionLayout } from "@/components/demo/DemoProductionLayout";

export const metadata: Metadata = {
  title: "Investor Quest — Live Demo",
  description:
    "Scripted product tour: logo intro, welcome, onboarding, quest map, and business island."
};

export default function DemoLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <DemoProductionLayout>{children}</DemoProductionLayout>;
}
