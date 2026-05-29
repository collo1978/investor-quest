import type { Metadata } from "next";

import { SchoolsDemoProductionLayout } from "@/components/schools/SchoolsDemoProductionLayout";

export const metadata: Metadata = {
  title: "Investor Quest — Schools Live Demo",
  description:
    "Scripted Schools tour: logo intro, avatar, onboarding, quest map, and business island."
};

export default function SchoolsDemoLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <SchoolsDemoProductionLayout>{children}</SchoolsDemoProductionLayout>;
}
