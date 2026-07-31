"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useOptionalGame } from "@/components/GameProvider";
import { resetSchoolsProfileCreation } from "@/lib/schools/resetSchoolsDemoProgress";

type Props = {
  className?: string;
};

const DEFAULT_CLASS =
  "pointer-events-auto inline-flex items-center gap-2 rounded-full border border-violet-400/35 bg-[rgba(8,7,4,0.88)] px-3 py-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-violet-200/95 shadow-[0_0_16px_rgba(139,92,246,0.12)] backdrop-blur-md transition hover:border-violet-300/50 hover:bg-violet-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/70 disabled:cursor-not-allowed disabled:opacity-60";

/** Replays profile creation (name, avatar, armor, learner-type, interests) from scratch. */
export function SchoolsProfileReplayButton({ className = DEFAULT_CLASS }: Props) {
  const router = useRouter();
  const game = useOptionalGame();
  const [busy, setBusy] = useState(false);

  const onReplay = useCallback(() => {
    if (busy) return;
    const ok = window.confirm(
      "Replay profile creation? Name, avatar, learner type, and interests will be cleared and the onboarding flow will restart from the beginning."
    );
    if (!ok) return;

    setBusy(true);
    try {
      resetSchoolsProfileCreation(
        router,
        game ? { replaceGameState: game.actions.replaceGameState } : undefined
      );
    } finally {
      setBusy(false);
    }
  }, [busy, router, game]);

  return (
    <button type="button" onClick={onReplay} disabled={busy} className={className}>
      {busy ? "Restarting…" : "Replay profile creation"}
    </button>
  );
}
