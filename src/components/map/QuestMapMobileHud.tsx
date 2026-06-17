"use client";

import { motion } from "framer-motion";
import { useEffect, useId, useState } from "react";

type Props = {
  progressPct: number;
  xp: number;
};

/**
 * Top mobile game HUD — company, progress %, XP bar (bank preview map).
 */
export function QuestMapMobileHud({
  progressPct,
  xp
}: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(progressPct)));
  const xpInLevel = xp % 100;
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none absolute inset-x-0 top-0 z-[30] px-3"
      style={{
        paddingTop: "calc(env(safe-area-inset-top) + 16px)"
      }}
    >
      <div className="relative mx-auto max-w-[420px]">
        <div
          className="pointer-events-auto rounded-2xl border border-violet-400/35 bg-[rgba(6,5,16,0.88)] px-3 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.45),0_0_24px_rgba(139,92,246,0.12)] backdrop-blur-md"
          role="status"
          aria-label={`Quest progress ${pct} percent`}
        >
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((o) => !o)}
              className={[
                "relative grid h-10 w-10 shrink-0 place-items-center rounded-full border",
                "border-violet-400/35 bg-[rgba(10,9,20,0.82)]",
                "shadow-[0_0_0_1px_rgba(139,92,246,0.18),0_0_18px_rgba(59,130,246,0.22),0_0_22px_rgba(139,92,246,0.18)]",
                "transition-transform duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
              ].join(" ")}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(59,130,246,0.18),transparent_60%)]"
              />
              <svg
                viewBox="0 0 24 24"
                className="relative h-5 w-5"
                fill="none"
                stroke="rgba(237,233,254,0.92)"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M5 7h14" />
                <path d="M5 12h14" />
                <path d="M5 17h14" />
              </svg>
            </button>

            <span
              className="shrink-0 font-[var(--font-grotesk)] text-base font-extrabold tabular-nums text-violet-200"
              style={{ textShadow: "0 0 14px rgba(59,130,246,0.25), 0 0 12px rgba(168,85,247,0.35)" }}
            >
              {pct}%
            </span>
          </div>

          <div className="mt-2">
            <div className="relative h-[6px] min-w-0 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(59,130,246,0.14) 0%, rgba(139,92,246,0.18) 45%, rgba(59,130,246,0.12) 100%)"
                }}
              />
              <motion.div
                className="relative h-full rounded-full"
                initial={false}
                animate={{ width: `${Math.min(100, xpInLevel)}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background:
                    "linear-gradient(90deg, rgba(59,130,246,0.92) 0%, rgba(139,92,246,0.98) 55%, rgba(147,197,253,0.95) 100%)",
                  boxShadow:
                    "0 0 0 1px rgba(191,219,254,0.28), 0 0 14px rgba(59,130,246,0.28), 0 0 18px rgba(139,92,246,0.25)"
                }}
              />
              <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                initial={false}
                animate={{ opacity: [0.22, 0.4, 0.22] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 45%, transparent 90%)"
                }}
              />
            </div>
          </div>
        </div>

        {menuOpen ? (
          <>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="pointer-events-auto fixed inset-0 z-[28] cursor-default bg-transparent"
            />
            <motion.div
              id={menuId}
              role="menu"
              aria-label="Menu"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto absolute left-0 right-0 top-full z-[29] mt-2 overflow-hidden rounded-2xl border border-violet-400/30 bg-[rgba(8,7,18,0.82)] shadow-[0_18px_60px_rgba(0,0,0,0.55),0_0_32px_rgba(139,92,246,0.12)] backdrop-blur-xl"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.10),rgba(139,92,246,0.12),transparent_60%)]"
              />
              <button
                type="button"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="relative w-full px-4 py-3 text-left text-sm font-semibold text-violet-100 transition hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
              >
                Profile
              </button>
            </motion.div>
          </>
        ) : null}
      </div>
    </motion.header>
  );
}
