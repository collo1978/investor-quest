"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useRunOnceOnMount } from "@/hooks/useRunOnceOnMount";
import {
  BANK_BROKER_PREVIEW_ROUTES,
  findBankBrokerPreviewRoute,
  labelForBankBrokerPreviewRoute,
  previewRoutesMatch,
  routeFromBankBrokerPreviewQuery
} from "@/lib/bank/bankBrokerPreviewRoutes";
import {
  MOBILE_PREVIEW_READY_MESSAGE,
  withMobilePreviewQuery
} from "@/lib/bank/mobilePreviewEmbed";
import {
  prefetchBankBrokerMobilePreview,
  prefetchBankBrokerPreviewRoute,
  prefetchBankBrokerPreviewRoutesIdle,
  preloadBankBrokerPreviewRouteAssets
} from "@/lib/bank/prefetchBankBrokerMobilePreview";
import { deactivateDemoStory } from "@/lib/demo/demoStoryMode";
import { deactivateSchoolsDemoStory } from "@/lib/schools/schoolsDemoStoryMode";

const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 844;

/** Show iframe quickly — don't block on full document load. */
const SOFT_REVEAL_MS = 450;
/** Remove overlay even if load/postMessage hasn't fired yet. */
const MAX_OVERLAY_MS = 1400;
/** Hint when dev compilation is still running. */
const STUCK_HINT_MS = 5000;

type FrameLoadPhase = "blocking" | "soft" | "idle";

function readIframePath(iframe: HTMLIFrameElement | null): string | null {
  try {
    return iframe?.contentWindow?.location.pathname ?? null;
  } catch {
    return null;
  }
}

function readIframeSearch(iframe: HTMLIFrameElement | null): string {
  try {
    return iframe?.contentWindow?.location.search ?? "";
  } catch {
    return "";
  }
}

function iframeMatchesRoute(
  iframe: HTMLIFrameElement | null,
  expectedHref: string
): boolean {
  const path = readIframePath(iframe);
  if (!path) return false;
  return previewRoutesMatch(path, readIframeSearch(iframe), expectedHref);
}

function PhonePreviewLoadingOverlay({
  label,
  phase,
  showStuckHint
}: {
  label: string;
  phase: FrameLoadPhase;
  showStuckHint: boolean;
}) {
  if (phase === "idle") return null;

  if (phase === "soft") {
    return (
      <div
        className="pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full border border-violet-400/30 bg-[rgba(8,6,18,0.92)] px-3 py-1.5 backdrop-blur-md"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-violet-200/90">
          {showStuckHint ? "Compiling route…" : "Loading…"}
        </span>
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-2 z-30 flex flex-col items-center justify-center rounded-[2.35rem] bg-[#030308]/72 backdrop-blur-sm"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-violet-400/25 border-t-violet-400/90"
        aria-hidden
      />
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-200/90">
        Loading
      </p>
      <p className="mt-1 max-w-[220px] text-center text-xs text-ink-2">{label}</p>
      {showStuckHint ? (
        <p className="mt-3 max-w-[240px] text-center text-[11px] leading-relaxed text-ink-2">
          First visit compiles this route in dev — preview will show while assets
          finish loading.
        </p>
      ) : null}
    </div>
  );
}

export function BankBrokerMobilePreview() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeReadyRef = useRef(false);
  const loadTimersRef = useRef<number[]>([]);
  const expectedRouteRef = useRef(
    routeFromBankBrokerPreviewQuery(searchParams.get("route"))
  );

  const activeRoute = routeFromBankBrokerPreviewQuery(searchParams.get("route"));
  const [loadPhase, setLoadPhase] = useState<FrameLoadPhase>("blocking");
  const [loadingLabel, setLoadingLabel] = useState(() =>
    labelForBankBrokerPreviewRoute(activeRoute)
  );
  const [showStuckHint, setShowStuckHint] = useState(false);

  expectedRouteRef.current = activeRoute;

  const clearLoadTimers = useCallback(() => {
    for (const id of loadTimersRef.current) {
      window.clearTimeout(id);
    }
    loadTimersRef.current = [];
  }, []);

  const finishNavigation = useCallback(() => {
    clearLoadTimers();
    setLoadPhase("idle");
    setShowStuckHint(false);
  }, [clearLoadTimers]);

  const beginNavigation = useCallback(
    (href: string) => {
      clearLoadTimers();
      setLoadingLabel(labelForBankBrokerPreviewRoute(href));
      setLoadPhase("blocking");
      setShowStuckHint(false);

      loadTimersRef.current.push(
        window.setTimeout(() => setLoadPhase("soft"), SOFT_REVEAL_MS),
        window.setTimeout(() => setLoadPhase("idle"), MAX_OVERLAY_MS),
        window.setTimeout(() => setShowStuckHint(true), STUCK_HINT_MS)
      );
    },
    [clearLoadTimers]
  );

  useRunOnceOnMount(() => {
    deactivateDemoStory();
    deactivateSchoolsDemoStory();
    prefetchBankBrokerMobilePreview((href) => router.prefetch(href));
  });

  useEffect(() => {
    return () => clearLoadTimers();
  }, [clearLoadTimers]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== MOBILE_PREVIEW_READY_MESSAGE) return;

      const loadedPath =
        typeof event.data.path === "string" ? event.data.path : null;
      const loadedSearch =
        typeof event.data.search === "string" ? event.data.search : "";
      if (
        !loadedPath ||
        !previewRoutesMatch(
          loadedPath,
          loadedSearch,
          expectedRouteRef.current
        )
      ) {
        return;
      }

      finishNavigation();
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [finishNavigation]);

  const syncQueryToIframePath = useCallback(
    (path: string, search: string) => {
      const match = findBankBrokerPreviewRoute(path, search);
      if (!match || match === activeRoute) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("route", match);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [activeRoute, pathname, router, searchParams]
  );

  const navigateIframe = useCallback(
    (href: string) => {
      const previewHref = withMobilePreviewQuery(href);
      const iframe = iframeRef.current;

      if (iframeMatchesRoute(iframe, href)) {
        finishNavigation();
        return;
      }

      beginNavigation(href);

      if (!iframe) return;

      if (iframeReadyRef.current && iframe.contentWindow) {
        iframe.contentWindow.location.assign(previewHref);
        return;
      }

      iframe.src = previewHref;
    },
    [beginNavigation, finishNavigation]
  );

  useEffect(() => {
    navigateIframe(activeRoute);
  }, [activeRoute, navigateIframe]);

  const handleIframeLoad = useCallback(() => {
    iframeReadyRef.current = true;

    const iframe = iframeRef.current;
    const path = readIframePath(iframe);
    const search = readIframeSearch(iframe);
    const expected = expectedRouteRef.current;

    if (!path) {
      finishNavigation();
      return;
    }

    if (!previewRoutesMatch(path, search, expected)) {
      return;
    }

    finishNavigation();
    syncQueryToIframePath(path, search);

    prefetchBankBrokerPreviewRoutesIdle(
      (href) => router.prefetch(href),
      expected
    );
  }, [finishNavigation, router, syncQueryToIframePath]);

  const pushRoute = useCallback(
    (href: string) => {
      if (href === activeRoute) return;
      preloadBankBrokerPreviewRouteAssets(href);
      prefetchBankBrokerPreviewRoute(href, (route) => router.prefetch(route));
      const params = new URLSearchParams(searchParams.toString());
      params.set("route", href);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [activeRoute, pathname, router, searchParams]
  );

  const warmRoute = useCallback(
    (href: string) => {
      preloadBankBrokerPreviewRouteAssets(href);
      prefetchBankBrokerPreviewRoute(href, (route) => router.prefetch(route));
    },
    [router]
  );

  const frameBusy = loadPhase !== "idle";

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[#030308] text-ink-0">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 18%, rgba(139,92,246,0.14), transparent 62%), radial-gradient(ellipse 45% 35% at 82% 88%, rgba(59,130,246,0.08), transparent 55%)"
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-6xl flex-col px-4 py-8 md:px-8 md:py-10">
        <header className="mx-auto w-full max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-300/75">
            Dev preview
          </p>
          <h1 className="mt-2 font-[var(--font-grotesk)] text-2xl font-semibold tracking-tight text-ink-0 md:text-3xl">
            Bank/Broker Mobile Preview
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">
            Inspect Bank/Broker and Schools mobile screens in an iPhone frame —
            pick a screen from the list, no demo launcher or funnel replay.
          </p>
        </header>

        <div className="mt-6 flex flex-col items-center gap-6 md:mt-8 md:flex-row md:items-start md:justify-center">
          <aside className="pointer-events-auto relative z-20 w-full max-w-xs shrink-0 md:sticky md:top-10">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-2">
              Screen
            </p>
            <div className="grid gap-2">
              {BANK_BROKER_PREVIEW_ROUTES.map((item) => {
                const active = item.href === activeRoute;
                const pending = frameBusy && active;
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => pushRoute(item.href)}
                    onMouseEnter={() => warmRoute(item.href)}
                    onFocus={() => warmRoute(item.href)}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "cursor-pointer rounded-xl border px-3 py-2 text-left text-sm font-medium transition",
                      active
                        ? "border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.12)] text-neon-300"
                        : "border-panel-border bg-[rgba(255,255,255,0.03)] text-ink-1 hover:bg-[rgba(255,255,255,0.06)] hover:text-ink-0"
                    ].join(" ")}
                  >
                    <span className="flex items-center justify-between gap-2">
                      {item.label}
                      {pending ? (
                        <span className="text-[10px] font-normal uppercase tracking-[0.14em] text-violet-300/80">
                          …
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-2">
              Each screen loads directly — use the list to jump between mobile
              views. Assets preload on hover.
            </p>
          </aside>

          <div className="flex shrink-0 flex-col items-center">
            <div
              className="relative rounded-[3rem] border-[10px] border-[#15151a] bg-[#0a0a0f] p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_28px_80px_rgba(0,0,0,0.65),0_0_120px_rgba(139,92,246,0.12)]"
              style={{ width: PHONE_WIDTH + 24, height: PHONE_HEIGHT + 24 }}
              aria-busy={frameBusy}
            >
              <div
                className="pointer-events-none absolute left-1/2 top-[18px] z-20 h-[26px] w-[108px] -translate-x-1/2 rounded-full bg-[#050508]"
                aria-hidden
              />
              <PhonePreviewLoadingOverlay
                label={loadingLabel}
                phase={loadPhase}
                showStuckHint={showStuckHint}
              />
              <iframe
                ref={iframeRef}
                title="Bank/Broker mobile preview"
                width={PHONE_WIDTH}
                height={PHONE_HEIGHT}
                onLoad={handleIframeLoad}
                className="block overflow-hidden rounded-[2.35rem] bg-[#030308]"
              />
            </div>
            <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-ink-2">
              iPhone viewport · {PHONE_WIDTH}×{PHONE_HEIGHT}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
