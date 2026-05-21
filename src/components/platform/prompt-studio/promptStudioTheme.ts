export const panelClass =
  "rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]";

export const btnPrimary =
  "min-h-[48px] rounded-xl bg-[var(--partner-primary)] px-4 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 touch-manipulation";

export const btnGhost =
  "min-h-[48px] rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10 disabled:opacity-45 touch-manipulation";

export const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none ring-[var(--partner-primary)]/40 focus:ring-2";

export const textareaClass =
  "min-h-[240px] w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs leading-relaxed text-white/90 outline-none ring-[var(--partner-primary)]/40 focus:ring-2";

export const tabClass = (active: boolean) =>
  `shrink-0 rounded-xl px-4 py-2.5 text-xs font-semibold transition touch-manipulation ${
    active
      ? "bg-[var(--partner-primary)]/25 text-white"
      : "text-white/55 hover:bg-white/5 hover:text-white/80"
  }`;

export function scoreColor(score: number): string {
  if (score >= 75) return "text-emerald-300";
  if (score >= 55) return "text-amber-200";
  return "text-rose-300";
}

export function encodeTemplateKey(key: string) {
  return encodeURIComponent(key);
}
