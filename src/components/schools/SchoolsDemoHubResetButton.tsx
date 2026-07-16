"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useOptionalGame } from "@/components/GameProvider";
import { isSchoolsDemoPath } from "@/lib/schools/schoolsDemoHref";
import { resetSchoolsDemoProgress } from "@/lib/schools/resetSchoolsDemoProgress";
import { isSchoolsDemoStoryModeActive } from "@/lib/schools/schoolsDemoStoryMode";

type Props = {
  className?: string;
};

const DEFAULT_CLASS =
  "pointer-events-auto inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-[rgba(8,7,4,0.88)] px-3 py-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-amber-200/95 shadow-[0_0_16px_rgba(245,197,71,0.12)] backdrop-blur-md transition hover:border-amber-300/50 hover:bg-amber-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 disabled:cursor-not-allowed disabled:opacity-60 sm:px-3.5 sm:py-2.5 sm:text-[11px]";

/** Presenter reset — clears quest reads, checklist, evidence, returns to map brief. */
export function SchoolsDemoHubResetButton({ className = DEFAULT_CLASS }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const game = useOptionalGame();
  const [busy, setBusy] = useState(false);

  const visible = isSchoolsDemoPath(pathname) && isSchoolsDemoStoryModeActive();

  const onReset = useCallback(() => {
    if (busy) return;
    const ok = window.confirm(
      "Reset Schools demo progress? Business Island story trail and notebook return to the start. The map envelope mission brief will replay."
    );
    if (!ok) return;

    setBusy(true);
    try {
      resetSchoolsDemoProgress(
        pathname,
        router,
        game ? { replaceGameState: game.actions.replaceGameState } : undefined
      );
    } finally {
      setBusy(false);
    }
  }, [busy, pathname, router, game]);

  if (!visible) return null;

  return (
    <button type="button" onClick={onReset} disabled={busy} className={className}>
      {busy ? "Resetting…" : "Reset demo"}
    </button>
  );
}
