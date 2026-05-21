import { Suspense } from "react";
import { DashboardAppClient } from "@/components/platform/DashboardAppClient";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#070712] text-sm text-white/60">
          Loading dashboards…
        </div>
      }
    >
      <DashboardAppClient>{children}</DashboardAppClient>
    </Suspense>
  );
}
