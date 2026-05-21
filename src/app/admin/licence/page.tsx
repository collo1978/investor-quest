"use client";

import { usePartnerPreview } from "@/components/platform/PartnerPreviewContext";
import { getPackageTier } from "@/platform/packages/packageDefinitions";

export default function AdminLicencePage() {
  const { partner } = usePartnerPreview();
  const tier = getPackageTier(partner.licence.packageTierId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Licence settings</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/65">
          Licence row is the billing + enforcement record. Swap for Stripe /
          contract system.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/75">
          <div>
            <span className="text-white/45">Licence id:</span>{" "}
            {partner.licence.licenceId}
          </div>
          <div className="mt-2">
            <span className="text-white/45">Expires:</span>{" "}
            {partner.licence.expiresAt}
          </div>
          <div className="mt-2">
            <span className="text-white/45">Package tier:</span>{" "}
            {tier.displayName}
          </div>
          <div className="mt-2">
            <span className="text-white/45">Seat cap:</span>{" "}
            {partner.licence.maxSeats.toLocaleString()}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/75">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Dashboard access
          </div>
          <ul className="mt-3 space-y-2">
            <li>School: {partner.licence.dashboardAccess.school ? "on" : "off"}</li>
            <li>Bank: {partner.licence.dashboardAccess.bank ? "on" : "off"}</li>
            <li>Broker: {partner.licence.dashboardAccess.broker ? "on" : "off"}</li>
          </ul>
          <div className="mt-4 text-[11px] text-white/55">
            Analytics: {partner.policy.analyticsAccessLevel} · Export:{" "}
            {partner.policy.dataExportAccess} · API:{" "}
            {partner.policy.apiIntegrationAccess}
          </div>
        </div>
      </div>
    </div>
  );
}
