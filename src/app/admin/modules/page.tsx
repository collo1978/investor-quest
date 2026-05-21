"use client";

import { usePartnerPreview } from "@/components/platform/PartnerPreviewContext";
import { MODULE_CATALOG } from "@/platform/modules/moduleCatalog";
import type { ModuleId } from "@/platform/types";
import { getPackageTier } from "@/platform/packages/packageDefinitions";

export default function AdminModulesPage() {
  const { partner } = usePartnerPreview();
  const tier = getPackageTier(partner.licence.packageTierId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-white">Modules</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/65">
          Enabled modules for this org vs package tier ceiling (
          {tier.displayName}).
        </p>
      </header>

      <div className="grid gap-3">
        {(Object.keys(MODULE_CATALOG) as ModuleId[]).map((id) => {
          const meta = MODULE_CATALOG[id];
          const orgOn = partner.policy.enabledModuleIds.includes(id);
          const tierOn = tier.enabledModuleIds.includes(id);
          return (
            <div
              key={id}
              className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="text-sm font-semibold text-white">
                  {meta.label}
                </div>
                <div className="mt-1 text-xs text-white/60">{meta.description}</div>
                <div className="mt-2 text-[10px] uppercase tracking-wide text-white/40">
                  {id}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span
                  className={
                    tierOn
                      ? "rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-100 ring-1 ring-emerald-400/30"
                      : "rounded-full bg-white/5 px-2 py-1 text-white/50 ring-1 ring-white/10"
                  }
                >
                  Tier: {tierOn ? "included" : "locked"}
                </span>
                <span
                  className={
                    orgOn
                      ? "rounded-full bg-[color-mix(in_srgb,var(--partner-primary)_25%,transparent)] px-2 py-1 text-white ring-1 ring-white/15"
                      : "rounded-full bg-white/5 px-2 py-1 text-white/50 ring-1 ring-white/10"
                  }
                >
                  Org: {orgOn ? "on" : "off"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
