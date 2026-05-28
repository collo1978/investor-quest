"use client";

type Props = {
  loading: boolean;
  error: string | null;
  onLoad: () => void;
  autoLoadFailed?: boolean;
};

export function RecoveryAuditLoadInline({
  loading,
  error,
  onLoad,
  autoLoadFailed
}: Props) {
  return (
    <div className="rounded-xl border border-violet-500/35 bg-violet-500/[0.08] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200/80">
        Card-level audit
      </p>
      {loading ? (
        <>
          <p className="mt-2 text-[14px] font-semibold text-white/90">
            Loading flagged cards…
          </p>
          <p className="mt-1 text-[12px] text-white/50">
            Scanning quest copy for jargon, plain-language issues, and regen targets.
          </p>
          <div
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10"
            aria-hidden
          >
            <div className="h-full w-1/3 animate-pulse rounded-full bg-violet-400/80" />
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-[14px] font-semibold text-white/90">
            {autoLoadFailed
              ? "Could not load flagged cards automatically"
              : "Flagged card copy is not loaded yet"}
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/50">
            {error ??
              "Run a targeted communication audit to surface the exact sentence, fix path, and regenerate actions."}
          </p>
          <button
            type="button"
            disabled={loading}
            className="mt-4 min-h-[48px] w-full rounded-xl border border-[var(--partner-primary)] bg-[var(--partner-primary)] px-4 py-3 text-[15px] font-bold text-black touch-manipulation disabled:opacity-50 active:scale-[0.99]"
            onClick={onLoad}
          >
            Load flagged cards
          </button>
        </>
      )}
    </div>
  );
}
