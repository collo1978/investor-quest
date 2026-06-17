import type { Metadata } from "next";
import { Suspense } from "react";

import { DemoProductionLayout } from "@/components/demo/DemoProductionLayout";

export const metadata: Metadata = {
  title: "Investor Quest — Live Demo",
  description:
    "Scripted product tour: logo intro, welcome, onboarding, quest map, and business island."
};

function DemoLayoutFallback() {
  return (
    <div
      className="pointer-events-auto min-h-[100dvh] bg-[#030308]"
      aria-busy="true"
    />
  );
}

export default function DemoLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DemoLayoutFallback />}>
      <DemoProductionLayout>{children}</DemoProductionLayout>
    </Suspense>
  );
}
