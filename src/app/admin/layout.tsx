import { Suspense } from "react";
import { AdminAppClient } from "@/components/platform/AdminAppClient";

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#070712] text-sm text-white/60">
          Loading partner console…
        </div>
      }
    >
      <AdminAppClient>{children}</AdminAppClient>
    </Suspense>
  );
}
