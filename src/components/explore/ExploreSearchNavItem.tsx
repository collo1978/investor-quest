"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { ExploreCompanySearch } from "@/components/explore/ExploreCompanySearch";
import { EXPLORE_SEARCH_LABEL } from "@/lib/navConfig";

type Props = {
  /** Highlight row when explore search panel is open. */
  active?: boolean;
  onNavigate?: () => void;
  /** Tighter padding for desktop sidebar. */
  variant?: "desktop" | "mobile";
};

export function ExploreSearchNavItem({
  active = false,
  onNavigate,
  variant = "desktop"
}: Props) {
  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  const rowClass =
    variant === "mobile"
      ? [
          "flex w-full min-h-[48px] items-center justify-between gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold transition",
          open || active
            ? "bg-[rgba(139,92,246,0.18)] text-neon-200 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.35)]"
            : "text-ink-0 active:bg-white/[0.06]"
        ].join(" ")
      : [
          "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition",
          open || active
            ? "bg-[rgba(139,92,246,0.18)] text-neon-200"
            : "text-ink-1 hover:bg-[rgba(255,255,255,0.04)] hover:text-ink-0"
        ].join(" ");

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={rowClass}
        aria-expanded={open}
      >
        <span>{EXPLORE_SEARCH_LABEL}</span>
        <svg
          viewBox="0 0 24 24"
          className={[
            "h-4 w-4 shrink-0 text-violet-300/80 transition-transform duration-200",
            open ? "rotate-180" : ""
          ].join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className={
                variant === "mobile"
                  ? "border-t border-white/[0.06] px-3 pb-3 pt-2"
                  : "mt-1.5 pl-0.5"
              }
            >
              <ExploreCompanySearch onSelected={onNavigate} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}
