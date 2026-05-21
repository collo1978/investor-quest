"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import { usePartnerRegistryHydration } from "@/hooks/usePartnerRegistryHydration";
import { listPartners } from "@/platform/partners/partnerRegistry";

const DASH_NAV = [
  { href: "/dashboard/school", label: "Schools" },
  { href: "/dashboard/bank", label: "Banks" },
  { href: "/dashboard/broker", label: "Brokers" }
] as const;

export function DashboardAppClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { version: registryVersion } = usePartnerRegistryHydration();
  const partners = useMemo(() => listPartners(), [registryVersion]);

  const shellStyle = useMemo(() => {
    const p = partners[0];
    return {
      ["--partner-primary" as string]: p.branding.colors.primary,
      ["--partner-accent" as string]: p.branding.colors.accent,
      ["--partner-surface" as string]: p.branding.colors.surface,
      ["--partner-text" as string]: p.branding.colors.text
    } as CSSProperties;
  }, [partners]);

  return (
    <div
      className="min-h-screen bg-[var(--partner-surface,#070712)] text-[var(--partner-text,#e4e4e7)]"
      style={shellStyle}
    >
      <header className="border-b border-white/10 px-4 py-4 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
              Partner analytics
            </div>
            <div className="text-lg font-semibold text-white">
              Engagement dashboards
            </div>
          </div>
          <Link
            href="/home"
            className="text-xs font-semibold text-[var(--partner-accent)] hover:underline"
          >
            ← Investor Quest
          </Link>
        </div>
        <nav className="mt-4 flex flex-wrap gap-2" aria-label="Dashboard segments">
          {DASH_NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-xl px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-[color-mix(in_srgb,var(--partner-primary)_22%,transparent)] text-white ring-1 ring-white/10"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="px-4 py-6 md:px-8">{children}</div>
    </div>
  );
}
