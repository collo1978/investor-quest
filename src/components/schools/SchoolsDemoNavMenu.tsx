"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";

import { useSchoolsDemoStory } from "@/components/schools/SchoolsDemoStoryProvider";
import { isMobilePreviewEmbed } from "@/lib/bank/mobilePreviewEmbed";
import { navigateSchoolsDemoMenuHref } from "@/lib/schools/navigateSchoolsDemoStep";
import { readSchoolsMapMissionBriefDismissed } from "@/lib/schools/schoolsMapMissionBriefState";
import {
  SCHOOLS_DEV_SIDEBAR_WIDTH_PX,
  shouldOffsetSchoolsNavMenuForDevSidebar,
  shouldShowSchoolsNavMenu,
  SCHOOLS_DEMO_MENU_ITEMS
} from "@/lib/schools/schoolsDemoMenu";
import {
  isSchoolsDemoPath,
  resolveSchoolsLearnerHref
} from "@/lib/schools/schoolsDemoHref";
import { isSchoolsDemoStoryModeActive } from "@/lib/schools/schoolsDemoStoryMode";

/**
 * Persistent top-left dropdown for Schools routes — appears on the map after onboarding.
 */
export function SchoolsDemoNavMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { step } = useSchoolsDemoStory();
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mapBriefDismissed, setMapBriefDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return readSchoolsMapMissionBriefDismissed();
  });

  const storyStep =
    isSchoolsDemoStoryModeActive() && isSchoolsDemoPath(pathname) ? step : null;

  const visible =
    !isMobilePreviewEmbed() &&
    shouldShowSchoolsNavMenu(pathname, storyStep, {
      mapMissionBriefDismissed: mapBriefDismissed
    });

  const offsetForDevSidebar = shouldOffsetSchoolsNavMenuForDevSidebar(pathname);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const onMenuItemClick = useCallback(
    (schoolsPath: string) => (e: MouseEvent<HTMLAnchorElement>) => {
      if (!isSchoolsDemoPath(pathname) || !isSchoolsDemoStoryModeActive()) return;
      e.preventDefault();
      navigateSchoolsDemoMenuHref(schoolsPath, pathname, router);
      closeMenu();
    },
    [closeMenu, pathname, router]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const refreshBriefDismissed = () => {
      setMapBriefDismissed(readSchoolsMapMissionBriefDismissed());
    };
    refreshBriefDismissed();
    window.addEventListener("iq-schools-map-brief-dismissed", refreshBriefDismissed);
    return () => {
      window.removeEventListener("iq-schools-map-brief-dismissed", refreshBriefDismissed);
    };
  }, []);

  useEffect(() => {
    closeMenu();
  }, [closeMenu, pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeMenu, menuOpen]);

  if (!visible || !mounted) return null;

  const shellStyle = {
    paddingTop: "calc(env(safe-area-inset-top) + 12px)",
    paddingLeft: "calc(env(safe-area-inset-left) + 12px)",
    ...(offsetForDevSidebar
      ? ({
          ["--iq-schools-nav-menu-left-md" as string]: `calc(${SCHOOLS_DEV_SIDEBAR_WIDTH_PX}px + 12px)`
        } as React.CSSProperties)
      : {})
  } as React.CSSProperties;

  return createPortal(
    <div
      className={[
        "iq-schools-nav-menu-shell pointer-events-none fixed left-0 top-0 z-[110]",
        offsetForDevSidebar ? "iq-schools-nav-menu-shell--dev-sidebar" : ""
      ].join(" ")}
      style={shellStyle}
    >
      <div className="relative">
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((open) => !open)}
          className={[
            "iq-schools-demo-nav-menu-btn pointer-events-auto relative grid h-11 w-11 cursor-pointer place-items-center rounded-full border",
            "border-violet-400/55 bg-[rgba(8,7,18,0.94)]",
            "shadow-[0_0_0_1px_rgba(139,92,246,0.35),0_0_24px_rgba(139,92,246,0.32),0_8px_24px_rgba(0,0,0,0.5)]",
            "backdrop-blur-md transition-transform duration-150 active:scale-95",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
          ].join(" ")}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(139,92,246,0.28),transparent_62%)]"
          />
          <svg
            viewBox="0 0 24 24"
            className="relative h-5 w-5"
            fill="none"
            stroke="rgba(237,233,254,0.95)"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M5 7h14" />
            <path d="M5 12h14" />
            <path d="M5 17h14" />
          </svg>
        </button>

        {menuOpen ? (
          <>
            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              className="pointer-events-auto fixed inset-0 z-[109] cursor-default bg-transparent"
            />
            <div
              id={menuId}
              role="menu"
              aria-label="Schools menu"
              className="iq-schools-demo-nav-menu-panel pointer-events-auto absolute left-0 top-full z-[111] mt-2 min-w-[12.5rem] overflow-hidden rounded-2xl border border-violet-400/32 bg-[rgba(8,7,18,0.94)] shadow-[0_18px_60px_rgba(0,0,0,0.55),0_0_32px_rgba(139,92,246,0.14)] backdrop-blur-xl"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.08),rgba(139,92,246,0.12),transparent_60%)]"
              />
              {SCHOOLS_DEMO_MENU_ITEMS.map((item) => {
                const href = resolveSchoolsLearnerHref(item.path, pathname);
                return (
                  <Link
                    key={item.path}
                    href={href}
                    role="menuitem"
                    onClick={
                      isSchoolsDemoPath(pathname) && isSchoolsDemoStoryModeActive()
                        ? onMenuItemClick(item.path)
                        : closeMenu
                    }
                    className="relative block w-full px-4 py-3 text-left text-sm font-semibold text-violet-100 no-underline transition hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-300/70"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
