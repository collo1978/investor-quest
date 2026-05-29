"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ToastHost } from "@/components/ToastHost";
import { ConvictionQueueHost } from "@/components/conviction";
import { ExploreDesktopFlyout } from "@/components/ExploreDesktopFlyout";
import { useGame } from "@/components/GameProvider";
import { useReadingProgress } from "@/components/gameHooks";
import { Header } from "@/components/Header";
import { MobileNavDrawer } from "@/components/MobileNavDrawer";
import { levelProgress } from "@/lib/gameState";
import { LevelBar } from "@/components/LevelBar";
import { companyById, getPlayableDemoCompanies } from "@/lib/demoData";
import { EntryFunnelGuard } from "@/components/entry/EntryFunnelGuard";
import { InvestorQuestBrandLogo } from "@/components/InvestorQuestBrandLogo";
import { LevelUpFx, UnlockFx, QuestCompletionFx } from "@/ui";
import { pillarById } from "@/data/pillars";
import {
  CONTROLLED_DEMO_MODE,
  getControlledDemoIslandNav,
  getControlledDemoMobileTabNav,
  getControlledDemoPrimaryNav
} from "@/lib/demo/controlledDemo";
import { NVDA_UNLOCK_FX } from "@/lib/demo/nvidiaDemoVoice";
import {
  islandLinkActive,
  ISLAND_NAV,
  linkActive,
  linkClass,
  MOBILE_TAB_NAV,
  PRIMARY_NAV
} from "@/lib/navConfig";
import { isDemoPath, stripDemoPrefix } from "@/lib/demo/demoHref";
import { isSchoolsDemoPath, stripSchoolsDemoPrefix } from "@/lib/schools/schoolsDemoHref";

type SidebarNavItem = { href: string; label: string };

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { state, actions, fx } = useGame();
  const lp = levelProgress(state.xp);
  const reading = useReadingProgress();
  const company = companyById(state.activeCompanyId);
  const playableCompanies = getPlayableDemoCompanies();
  const primaryNav = CONTROLLED_DEMO_MODE
    ? getControlledDemoPrimaryNav()
    : PRIMARY_NAV;
  const mobileTabNav = CONTROLLED_DEMO_MODE
    ? getControlledDemoMobileTabNav()
    : MOBILE_TAB_NAV;
  const demoIslandNav = getControlledDemoIslandNav();
  const isDemoProduction = isDemoPath(pathname);
  const isSchoolsDemoProduction = isSchoolsDemoPath(pathname);
  const learnerPath = isDemoProduction
    ? stripDemoPrefix(pathname)
    : isSchoolsDemoProduction
      ? stripSchoolsDemoPrefix(pathname)
      : pathname;
  const isOnboarding = learnerPath.startsWith("/onboarding");
  const isEntryFunnel =
    learnerPath === "/opening" || learnerPath === "/welcome";
  const showAppChrome = !isOnboarding && !isEntryFunnel;
  const isDev = process.env.NODE_ENV !== "production";

  const bankBrokerNav: readonly SidebarNavItem[] = [
    { href: "/opening", label: "Opening Logo" },
    { href: "/welcome", label: "Welcome Intro" },
    { href: "/onboarding", label: "Onboarding" },
    { href: "/map", label: "Map" },
    { href: "/business", label: "Business" },
    { href: "/forces", label: "Forces" },
    { href: "/financials", label: "Financials" },
    { href: "/management", label: "Management" },
    { href: "/profile", label: "Profile" }
  ] as const;

  const schoolsNav: readonly SidebarNavItem[] = [
    { href: "/schools/demo", label: "Schools Live Demo" },
    { href: "/schools/opening", label: "Opening Logo" },
    { href: "/schools/avatar", label: "Choose Avatar" },
    { href: "/schools/onboarding", label: "Onboarding" },
    { href: "/schools/map", label: "Map" },
    { href: "/schools/business", label: "Business" },
    { href: "/schools/forces", label: "Forces" },
    { href: "/schools/financials", label: "Financials" },
    { href: "/schools/management", label: "Management" },
    { href: "/schools/profile", label: "Profile" }
  ] as const;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isPlatformSurface =
    pathname.startsWith("/admin") || pathname.startsWith("/dashboard");

  if (isSchoolsDemoProduction) {
    return (
      <div className="pointer-events-auto h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#05010f]">
        {children}
      </div>
    );
  }

  if (isDemoProduction) {
    return (
      <div className="pointer-events-auto min-h-[100dvh] bg-[#030308]">
        {children}
      </div>
    );
  }

  if (isEntryFunnel) {
    return (
      <div className="pointer-events-auto min-h-[100dvh] bg-[#030308]">
        <EntryFunnelGuard />
        {children}
        <ToastHost />
      </div>
    );
  }

  // Partner admin + analytics dashboards use their own chrome so we do not
  // stack the learner sidebar / mobile nav on top of multi-tenant tools.
  if (isPlatformSurface) {
    return (
      <div className="pointer-events-auto min-h-screen bg-bg-0">
        {children}
        <ToastHost />
        <ConvictionQueueHost />
        <LevelUpFx
          triggerKey={fx.levelUpKey}
          detail={fx.level ? `Reached Level ${fx.level}` : undefined}
        />
        <UnlockFx
          triggerKey={fx.unlockKey}
          title={(() => {
            if (!fx.unlockTitle) return "New island";
            try {
              return pillarById(
                fx.unlockTitle as Parameters<typeof pillarById>[0]
              ).title;
            } catch {
              return fx.unlockTitle;
            }
          })()}
          detail={
            CONTROLLED_DEMO_MODE
              ? NVDA_UNLOCK_FX.detail
              : "The bridge is live — continue your expedition on the map."
          }
        />
        <QuestCompletionFx
          triggerKey={fx.completionKey}
          xpGained={fx.completionXp ?? undefined}
        />
      </div>
    );
  }

  const unlockedPillarTitle = (() => {
    if (!fx.unlockTitle) return undefined;
    try {
      return pillarById(fx.unlockTitle as Parameters<typeof pillarById>[0])
        .title;
    } catch {
      return fx.unlockTitle;
    }
  })();

  return (
    <div
      className="pointer-events-auto min-h-screen bg-bg-0"
      style={
        {
          // used by /map to stay fully above mobile nav
          ["--mobile-nav-h" as any]: "128px"
        } as React.CSSProperties
      }
    >
      <EntryFunnelGuard />
      {/* Desktop sidebar */}
      <aside className="pointer-events-auto fixed inset-y-0 left-0 z-[100] hidden w-[280px] overflow-hidden border-r border-panel-border bg-[rgba(7,7,18,0.72)] backdrop-blur-xl md:block">
        <div className="relative z-10 flex h-full min-h-0 flex-col overflow-y-auto overscroll-y-contain p-5 [-webkit-overflow-scrolling:touch]">
          <Link
            href="/home"
            className="group relative z-10 inline-flex min-w-0 cursor-pointer items-center gap-3.5"
          >
            <InvestorQuestBrandLogo
              priority
              className="h-14 w-auto max-w-[188px] object-contain md:h-16 md:max-w-[232px]"
            />
            <div className="flex min-w-0 flex-col justify-center leading-tight">
              <div className="text-xs text-ink-2">
                {company.ticker} campaign
              </div>
            </div>
          </Link>

          <div className="mt-5 rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.03)] p-3">
            <div className="text-[11px] text-ink-2">Company</div>
            {CONTROLLED_DEMO_MODE ? (
              <div className="mt-2 rounded-xl border border-panel-border bg-[rgba(255,255,255,0.04)] px-3 py-2.5">
                <div className="text-sm font-semibold text-ink-0">
                  {company.name} ({company.ticker})
                </div>
                <p className="mt-1 text-[10px] leading-snug text-ink-2">
                  Real-life examples — games, AI apps, money you get
                </p>
              </div>
            ) : (
              <select
                suppressHydrationWarning
                value={state.activeCompanyId}
                onChange={(e) => actions.setActiveCompany(e.target.value)}
                className="mt-2 w-full rounded-xl border border-panel-border bg-[rgba(255,255,255,0.04)] px-3 py-2 text-xs text-ink-0 outline-none ring-neon-400/50 focus:ring-2"
              >
                {playableCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.ticker})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mt-4">
            <LevelBar
              level={lp.level}
              pct={lp.pct}
              label={`${lp.inLevel}/${lp.needed} XP`}
            />
            <div className="mt-2 text-[11px] leading-relaxed text-ink-2">
              <span
                className="font-semibold"
                style={{
                  color: "#F5C547",
                  textShadow: "0 0 14px rgba(245,197,71,0.35)"
                }}
              >
                Quiz {state.streaks?.quiz.streak ?? 0}d
              </span>
              <span className="text-ink-2"> · </span>
              <span className="text-ink-2/90">
                Consistency {state.streaks?.research.streak ?? 0}d
              </span>
              <span className="block text-[10px] text-ink-2/80">
                Understanding track is prestige · reading alone never builds quiz streak
              </span>
              <span className="mt-1 block text-ink-2">
                XP <span className="font-semibold text-ink-0">{state.xp}</span>
              </span>
            </div>

            {/* Reading-progress pulse — Mark as Read tracking (no XP). */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] text-ink-2">
                <span className="uppercase tracking-[0.16em]">
                  Cards read
                </span>
                <span className="font-semibold text-ink-0">
                  {reading.read}/{reading.total}
                  <span className="ml-2 text-ink-2">{reading.pct}%</span>
                </span>
              </div>
              <div className="mt-1.5 relative h-1.5 overflow-hidden rounded-full border border-panel-border bg-[rgba(255,255,255,0.03)]">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
                  style={{
                    width: `${reading.read === 0 ? 0 : Math.max(4, reading.pct)}%`,
                    background:
                      "linear-gradient(90deg, rgba(139,92,246,0.30), rgba(139,92,246,0.85), rgba(168,85,247,0.70))",
                    boxShadow:
                      reading.read > 0
                        ? "0 0 18px rgba(139,92,246,0.30)"
                        : "none"
                  }}
                />
              </div>
            </div>
          </div>

          <nav className="relative z-10 mt-6 grid gap-2" aria-label="Primary">
            {!CONTROLLED_DEMO_MODE ? (
              <ExploreDesktopFlyout pathname={pathname} />
            ) : null}
            {isDev ? (
              <div className="grid gap-2">
                <details
                  open
                  className="rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.02)] px-3 py-2"
                >
                  <summary className="cursor-pointer select-none py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-2">
                    Bank / Broker
                  </summary>
                  <div className="mt-2 grid gap-2 pb-1">
                    {bankBrokerNav.map((item) => {
                      const active =
                        learnerPath === item.href ||
                        learnerPath.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          prefetch={item.href !== "/profile"}
                          className={linkClass(active)}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </details>

                <details className="rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.02)] px-3 py-2">
                  <summary className="cursor-pointer select-none py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-2">
                    Schools
                  </summary>
                  <div className="mt-2 grid gap-2 pb-1">
                    {schoolsNav.map((item) => {
                      const active =
                        learnerPath === item.href ||
                        learnerPath.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          prefetch={item.href !== "/schools/profile"}
                          className={linkClass(active)}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </details>
              </div>
            ) : (
              <>
                <div className="pt-1">
                  <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-2">
                    Islands
                  </p>
                  <div className="grid gap-2">
                    {CONTROLLED_DEMO_MODE
                      ? demoIslandNav.map((item) => {
                          const active = islandLinkActive(pathname, item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              prefetch
                              className={linkClass(active)}
                            >
                              {item.label}
                            </Link>
                          );
                        })
                      : ISLAND_NAV.map((item) => {
                          const active = islandLinkActive(pathname, item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              prefetch
                              className={linkClass(active)}
                            >
                              {item.label}
                            </Link>
                          );
                        })}
                  </div>
                </div>
                {primaryNav.map((item) => {
                  const active = linkActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={item.href !== "/profile"}
                      className={linkClass(active)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          <div className="mt-auto rounded-2xl border border-panel-border bg-[rgba(0,0,0,0.20)] p-4">
            <div className="text-[11px] text-ink-2">Tip</div>
            <div className="mt-2 text-xs text-ink-1">
              Pass quizzes to grow your quiz streak (prestige + milestone XP). Consistency days
              are a separate habit signal.
            </div>
          </div>
        </div>
      </aside>

      {/* Main content — pointer-events-auto so clicks reach page links (sidebars stay pointer-events-auto) */}
      <div className="relative z-0 pointer-events-auto md:pl-[280px]">
        {showAppChrome ? (
          <Header
            onOpenMenu={() => setMobileMenuOpen(true)}
            menuOpen={mobileMenuOpen}
          />
        ) : null}
        <div className="pointer-events-auto pb-24">{children}</div>
      </div>

      {/* mobile bottom nav */}
      {showAppChrome && (
        <nav className="pointer-events-auto fixed bottom-0 left-0 right-0 z-[100] h-[var(--mobile-nav-h)] border-t border-panel-border bg-[rgba(7,7,18,0.78)] backdrop-blur-xl md:hidden">
          <div className="mx-auto h-full max-w-6xl px-3 py-2">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-[11px] text-ink-2">Company</div>
              <select
                suppressHydrationWarning
                value={state.activeCompanyId}
                onChange={(e) => actions.setActiveCompany(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-panel-border bg-[rgba(255,255,255,0.04)] px-3 py-2 text-[11px] text-ink-0 outline-none ring-neon-400/50 focus:ring-2"
              >
                {playableCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.ticker})
                  </option>
                ))}
              </select>
            </div>

            <div
              className={
                mobileTabNav.length === 2
                  ? "grid grid-cols-2 gap-0.5"
                  : "grid grid-cols-4 gap-0.5"
              }
            >
              {mobileTabNav.map((item) => {
                const active = linkActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={item.href !== "/profile"}
                    className={[
                      "relative z-10 flex cursor-pointer flex-col items-center justify-center rounded-xl px-1 py-2 text-[10px] font-semibold leading-tight transition sm:px-2 sm:text-xs",
                      active
                        ? "border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.10)] text-neon-300"
                        : "text-ink-2 hover:bg-[rgba(255,255,255,0.04)] hover:text-ink-0"
                    ].join(" ")}
                  >
                    <span className="font-semibold">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      <MobileNavDrawer
        open={mobileMenuOpen && showAppChrome}
        onClose={() => setMobileMenuOpen(false)}
        pathname={pathname}
        state={state}
        onCompanyChange={(id) => actions.setActiveCompany(id)}
        reading={reading}
      />

      <ToastHost />
      <ConvictionQueueHost />

      {/* Engine-driven progression FX */}
      <LevelUpFx
        triggerKey={fx.levelUpKey}
        detail={fx.level ? `Reached Level ${fx.level}` : undefined}
      />
      <UnlockFx
        triggerKey={fx.unlockKey}
        title={unlockedPillarTitle ?? "New island"}
        detail={
          CONTROLLED_DEMO_MODE
            ? NVDA_UNLOCK_FX.detail
            : "Open the map to enter."
        }
      />
      <QuestCompletionFx
        triggerKey={fx.completionKey}
        xpGained={fx.completionXp ?? undefined}
      />
    </div>
  );
}

