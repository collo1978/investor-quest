"use client";

import { usePartnerPreview } from "@/components/platform/PartnerPreviewContext";

export default function AdminUsersPage() {
  const { partner } = usePartnerPreview();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Users</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/65">
          Seat cap and allowed roles are licence-driven — connect to your IdP
          and provisioning webhooks later.
        </p>
      </header>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/75">
        <div>
          <span className="text-white/45">Max seats:</span>{" "}
          {partner.licence.maxSeats.toLocaleString()}
        </div>
        <div className="mt-3">
          <span className="text-white/45">Roles:</span>{" "}
          {partner.policy.allowedRoleIds.join(", ")}
        </div>
      </div>
    </div>
  );
}
