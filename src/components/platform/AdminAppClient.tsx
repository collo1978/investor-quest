"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type { PartnerConfig } from "@/platform/types";
import { PartnerPreviewProvider } from "@/components/platform/PartnerPreviewContext";
import { usePartnerRegistryHydration } from "@/hooks/usePartnerRegistryHydration";
import { useQuestCatalog } from "@/components/platform/QuestContentCatalogProvider";
import {
  DEFAULT_PARTNER_ID,
  listPartners
} from "@/platform/partners/partnerRegistry";

const ADMIN_NAV: ReadonlyArray<{
  href: string;
  label: string;
  mobileLabel?: string;
}> = [
  { href: "/admin/game-health", label: "Mission Control", mobileLabel: "Control" },
  { href: "/admin/branding", label: "Branding" },
  { href: "/admin/quests", label: "Quest content" },
  { href: "/admin/prompts", label: "Prompt Studio", mobileLabel: "Prompts" },
  { href: "/admin/quest-generation", label: "AI regeneration", mobileLabel: "Regen" },
  { href: "/admin/modules", label: "Modules" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/rewards", label: "Rewards" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/licence", label: "Licence settings" },
  { href: "/admin/gamification", label: "Gamification mechanics" }
];

const partnerSelectClass =
  "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none ring-[var(--partner-primary)]/40 focus:ring-2";

function ActivePartnerSelect({
  partnerId,
  partners,
  onChange
}: {
  partnerId: string;
  partners: readonly PartnerConfig[];
  onChange: (nextPartnerId: string) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const label =
    partners.find((p) => p.id === partnerId)?.branding.partnerName ?? partnerId;

  return (
    <label className="grid gap-1 text-[11px] text-white/60">
      Active partner
      {mounted ? (
        <select
          suppressHydrationWarning
          className={partnerSelectClass}
          value={partnerId}
          onChange={(e) => onChange(e.target.value)}
        >
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.branding.partnerName}
            </option>
          ))}
        </select>
      ) : (
        <div className={`${partnerSelectClass} text-white/70`} aria-hidden>
          {label}
        </div>
      )}
    </label>
  );
}

export function AdminAppClient({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const partnerFromQuery = searchParams.get("partner");

  const initialPartnerId = partnerFromQuery ?? DEFAULT_PARTNER_ID;

  useEffect(() => {
    if (!partnerFromQuery) {
      const next = new URLSearchParams(searchParams.toString());
      next.set("partner", initialPartnerId);
      router.replace(`${pathname}?${next.toString()}`);
    }
  }, [initialPartnerId, partnerFromQuery, pathname, router, searchParams]);

  const { version: registryVersion, source: catalogSource, refetch } =
    usePartnerRegistryHydration();
  const { refetch: refetchQuestCatalog } = useQuestCatalog();
  const partners = useMemo(() => listPartners(), [registryVersion]);

  useEffect(() => {
    if (!pathname.startsWith("/admin/quests")) return;
    void refetchQuestCatalog(initialPartnerId);
  }, [pathname, initialPartnerId, refetchQuestCatalog]);

  const isMobileFix = pathname.startsWith("/admin/mobile-fix/");

  const shellStyle = useMemo(() => {
    const p = partners.find((x) => x.id === initialPartnerId) ?? partners[0];
    if (!p) return undefined;
    return {
      ["--partner-primary" as string]: p.branding.colors.primary,
      ["--partner-secondary" as string]: p.branding.colors.secondary,
      ["--partner-accent" as string]: p.branding.colors.accent,
      ["--partner-surface" as string]: p.branding.colors.surface,
      ["--partner-text" as string]: p.branding.colors.text
    } as CSSProperties;
  }, [initialPartnerId, partners]);

  if (isMobileFix) {
    return (
      <PartnerPreviewProvider
        key={`${initialPartnerId}-${registryVersion}`}
        initialPartnerId={initialPartnerId}
        registryVersion={registryVersion}
        refreshCatalog={refetch}
      >
        <div
          className="min-h-[100dvh] bg-[#070712] text-white"
          style={shellStyle}
        >
          {children}
        </div>
      </PartnerPreviewProvider>
    );
  }

  return (
    <PartnerPreviewProvider
      key={`${initialPartnerId}-${registryVersion}`}
      initialPartnerId={initialPartnerId}
      registryVersion={registryVersion}
      refreshCatalog={refetch}
    >
      <div
        className="min-h-screen bg-[var(--partner-surface,#070712)] text-[var(--partner-text,#e4e4e7)]"
        style={shellStyle}
      >
        <div className="flex h-screen min-h-0 overflow-hidden">
          <aside className="hidden h-screen max-h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-black/30 backdrop-blur-xl md:flex">
            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-y-contain p-4 [-webkit-overflow-scrolling:touch]">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  Admin
                </div>
                <div className="mt-1 text-lg font-semibold text-white">
                  Partner console
                </div>
                <p className="mt-2 text-xs leading-relaxed text-white/60">
                  Partner catalog:{" "}
                  {catalogSource === "supabase" ? "Supabase" : "demo fallback"}
                  .
                </p>
              </div>

              <ActivePartnerSelect
                partnerId={initialPartnerId}
                partners={partners}
                onChange={(nextPartnerId) => {
                  const next = new URLSearchParams(searchParams.toString());
                  next.set("partner", nextPartnerId);
                  router.push(`${pathname}?${next.toString()}`);
                }}
              />

              <nav className="grid gap-1" aria-label="Admin sections">
                {ADMIN_NAV.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={`${item.href}?partner=${encodeURIComponent(initialPartnerId)}`}
                      className={[
                        "rounded-xl px-3 py-2 text-sm font-medium transition",
                        active
                          ? "bg-[color-mix(in_srgb,var(--partner-primary)_22%,transparent)] text-white shadow-[0_0_24px_color-mix(in_srgb,var(--partner-primary)_35%,transparent)]"
                          : "text-white/70 hover:bg-white/5 hover:text-white"
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto text-[10px] text-white/45">
                Investor Quest platform layer · edits persist on save
              </div>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 md:px-8">
              <Link
                href="/home"
                className="text-xs font-semibold text-[var(--partner-accent)] hover:underline"
              >
                ← Back to Investor Quest
              </Link>
              <div className="text-right text-[10px] uppercase tracking-[0.18em] text-white/50">
                Multi-tenant preview
              </div>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-6 pb-24 md:px-8 md:pb-6 [-webkit-overflow-scrolling:touch]">
              {children}
            </div>
          </div>
        </div>

        <nav
          className="fixed bottom-0 left-0 right-0 z-[120] flex gap-1 overflow-x-auto border-t border-white/10 bg-black/90 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
          aria-label="Mobile admin"
        >
          {ADMIN_NAV.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={`${item.href}?partner=${encodeURIComponent(initialPartnerId)}`}
                className={[
                  "min-h-[44px] shrink-0 whitespace-nowrap rounded-xl px-3 py-2.5 text-[11px] font-bold touch-manipulation",
                  active ? "bg-white/12 text-white" : "text-white/55"
                ].join(" ")}
              >
                {item.mobileLabel ?? item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </PartnerPreviewProvider>
  );
}
