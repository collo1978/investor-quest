"use client";

import { useCallback, useState } from "react";

import {
  clearCorruptSaveForFreshStart,
  readCorruptSaveRawBlobs,
  restoreProgressFromBackup
} from "@/engine/progression/persistence";

type Props = {
  onRestored: (mode: "backup" | "fresh") => void;
};

export function CorruptSaveRecoveryOverlay({ onRestored }: Props) {
  const [busy, setBusy] = useState<"backup" | "export" | "fresh" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { backup: hasBackupRaw } = readCorruptSaveRawBlobs();

  const handleRestoreBackup = useCallback(() => {
    setBusy("backup");
    setMessage(null);
    const restored = restoreProgressFromBackup();
    if (restored) {
      onRestored("backup");
    } else {
      setMessage(
        "Backup could not be read. Try Export for support, or start fresh."
      );
      setBusy(null);
    }
  }, [onRestored]);

  const handleExport = useCallback(async () => {
    setBusy("export");
    setMessage(null);
    try {
      const blobs = readCorruptSaveRawBlobs();
      const payload = JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          storageKey: "investor-quest::state",
          ...blobs
        },
        null,
        2
      );
      await navigator.clipboard.writeText(payload);
      setMessage("Save data copied to clipboard. Share with support if needed.");
    } catch {
      setMessage(
        "Could not copy to clipboard. Open devtools → Application → Local Storage."
      );
    } finally {
      setBusy(null);
    }
  }, []);

  const handleFreshStart = useCallback(() => {
    const ok = window.confirm(
      "Start a new campaign? Corrupt save data will be removed. This cannot be undone."
    );
    if (!ok) return;
    setBusy("fresh");
    clearCorruptSaveForFreshStart();
    onRestored("fresh");
  }, [onRestored]);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="corrupt-save-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#05050F]/92 px-4 backdrop-blur-md"
    >
      <div className="w-full max-w-md rounded-2xl border border-amber-500/35 bg-[#0a0a14]/95 p-6 shadow-[0_0_60px_-12px_rgba(245,158,11,0.35)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-400/90">
          Progress protected
        </p>
        <h2
          id="corrupt-save-title"
          className="mt-2 font-[var(--font-grotesk)] text-xl font-semibold text-white"
        >
          Saved progress could not be loaded
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed text-white/75">
          Your quest save on this device is damaged. We stopped before showing an
          empty campaign or overwriting your data. Choose how to continue.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          {hasBackupRaw ? (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void handleRestoreBackup()}
              className="min-h-[48px] rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-3 text-[14px] font-semibold text-emerald-100 touch-manipulation transition hover:bg-emerald-500/22 disabled:opacity-50"
            >
              {busy === "backup" ? "Restoring…" : "Restore from backup"}
            </button>
          ) : null}

          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void handleExport()}
            className="min-h-[48px] rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[14px] font-semibold text-white/85 touch-manipulation transition hover:bg-white/10 disabled:opacity-50"
          >
            {busy === "export" ? "Copying…" : "Copy save data for support"}
          </button>

          <button
            type="button"
            disabled={busy !== null}
            onClick={handleFreshStart}
            className="min-h-[48px] rounded-xl border border-white/10 px-4 py-3 text-[13px] font-semibold text-white/55 touch-manipulation transition hover:bg-white/5 hover:text-white/75 disabled:opacity-50"
          >
            {busy === "fresh" ? "Starting…" : "Start fresh (clears corrupt save)"}
          </button>
        </div>

        {message ? (
          <p
            className="mt-4 text-[13px] leading-relaxed text-amber-100/90"
            role="status"
          >
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
