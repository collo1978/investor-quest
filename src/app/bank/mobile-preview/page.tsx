import type { Metadata } from "next";
import { Suspense } from "react";

import { BankBrokerMobilePreview } from "@/components/bank/BankBrokerMobilePreview";

export const metadata: Metadata = {
  title: "Bank/Broker Mobile Preview — Investor Quest",
  description:
    "Desktop-only iPhone frame for inspecting individual Bank/Broker mobile screens.",
  robots: { index: false, follow: false }
};

function MobilePreviewFallback() {
  return (
    <div
      className="flex min-h-[100dvh] items-center justify-center bg-[#030308] text-sm text-ink-2"
      aria-busy="true"
    >
      Loading mobile preview…
    </div>
  );
}

export default function BankMobilePreviewPage() {
  return (
    <Suspense fallback={<MobilePreviewFallback />}>
      <BankBrokerMobilePreview />
    </Suspense>
  );
}
