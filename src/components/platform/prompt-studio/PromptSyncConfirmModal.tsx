"use client";

import { btnGhost, btnPrimary } from "./promptStudioTheme";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function PromptSyncConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Sync from code defaults",
  busy = false,
  onConfirm,
  onCancel
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="prompt-sync-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0f1118] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <h2
          id="prompt-sync-modal-title"
          className="text-lg font-semibold text-white"
        >
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70">{message}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className={btnGhost}
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={btnPrimary}
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "Syncing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
