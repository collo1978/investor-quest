"use client";

export function BusinessHubEmptyState() {
  return (
    <div
      className="flex min-h-[min(60dvh,420px)] w-full flex-col items-center justify-center gap-3 px-6 text-center"
      role="status"
    >
      <p className="text-sm font-semibold text-ink-0">Loading business quests…</p>
      <p className="max-w-sm text-xs leading-relaxed text-ink-2">
        If this stays empty, refresh the page or return from the quest map.
      </p>
    </div>
  );
}
