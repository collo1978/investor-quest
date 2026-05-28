"use client";

import { usePartnerPreview } from "@/components/platform/PartnerPreviewContext";
import type { GamificationMechanicDefinition } from "@/platform/gamification/mechanicsRegistry";
import type { PartnerType } from "@/platform/types";
import {
  effectiveMechanicEnabled,
  tierAllowsMechanic
} from "@/platform/partners/policyHelpers";

function statusBadge(status: GamificationMechanicDefinition["rolloutStatus"]) {
  const map = {
    active: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
    missing: "bg-rose-500/15 text-rose-200 ring-rose-400/30",
    planned: "bg-amber-500/15 text-amber-100 ring-amber-400/30"
  } as const;
  return map[status];
}

function partnerChips(fit: PartnerType[]) {
  return fit.map((t) => (
    <span
      key={t}
      className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70"
    >
      {t}
    </span>
  ));
}

export function GamificationMechanicsTable({
  rows,
  onEditHint
}: {
  rows: GamificationMechanicDefinition[];
  onEditHint: (message: string) => void;
}) {
  const { partner, mechanicOverrides, setMechanicEnabled } = usePartnerPreview();

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-6 text-center text-[13px] text-white/50">
        No mechanics mapped to this section yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
      <table className="min-w-[900px] w-full border-collapse text-left text-xs">
        <thead className="bg-white/5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
          <tr>
            <th className="px-3 py-3">Mechanic</th>
            <th className="px-3 py-3">Description</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Partner fit</th>
            <th className="px-3 py-3">Priority</th>
            <th className="px-3 py-3">Policy</th>
            <th className="px-3 py-3">Edit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => {
            const tierOk = tierAllowsMechanic(partner.licence.packageTierId, m.id);
            const enabled = effectiveMechanicEnabled({
              partner,
              mechanicId: m.id,
              overrides: mechanicOverrides
            });
            const toggleDisabled = m.rolloutStatus !== "active" || !tierOk;

            return (
              <tr
                key={m.id}
                className="border-t border-white/5 align-top text-white/80"
              >
                <td className="px-3 py-3 font-semibold text-white">{m.name}</td>
                <td className="max-w-[280px] px-3 py-3 text-[11px] leading-relaxed">
                  {m.description}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={[
                      "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
                      statusBadge(m.rolloutStatus)
                    ].join(" ")}
                  >
                    {m.rolloutStatus}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">{partnerChips(m.partnerFit)}</div>
                </td>
                <td className="px-3 py-3 capitalize">{m.priority}</td>
                <td className="px-3 py-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-[11px]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[var(--partner-primary)]"
                      checked={enabled}
                      disabled={toggleDisabled}
                      onChange={() => {
                        if (toggleDisabled) return;
                        setMechanicEnabled(m.id, !enabled);
                      }}
                    />
                    {toggleDisabled
                      ? m.rolloutStatus !== "active"
                        ? "N/A"
                        : "Tier"
                      : enabled
                        ? "On"
                        : "Off"}
                  </label>
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-semibold text-white/80 transition hover:bg-white/10"
                    onClick={() =>
                      onEditHint(`Edit “${m.name}” — connects to partner policy API (placeholder).`)
                    }
                  >
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
