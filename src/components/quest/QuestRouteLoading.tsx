/**
 * Shown while quest detail routes compile/load (dynamic import).
 * Gives immediate feedback so hub clicks do not feel frozen.
 */
export function QuestRouteLoading() {
  return (
    <main
      className="pointer-events-none relative mx-auto w-full max-w-4xl animate-pulse px-4 pb-28 pt-6 md:px-6 md:pt-8"
      aria-busy="true"
      aria-label="Loading quest"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="h-9 w-36 rounded-xl bg-[rgba(255,255,255,0.06)]" />
        <div className="h-5 w-24 rounded bg-[rgba(255,255,255,0.05)]" />
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-[rgba(245,197,71,0.12)]" />
      <article className="mt-5 overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(10,10,14,0.94)]">
        <div className="border-b border-white/[0.06] px-6 py-6 md:px-9">
          <div className="mx-auto h-4 w-40 rounded bg-[rgba(245,197,71,0.15)]" />
          <div className="mx-auto mt-3 h-7 w-3/4 max-w-md rounded bg-[rgba(255,255,255,0.08)]" />
          <div className="mx-auto mt-2 h-4 w-full max-w-lg rounded bg-[rgba(255,255,255,0.05)]" />
        </div>
        <div className="space-y-4 px-5 py-8 sm:px-6 md:px-9">
          <div className="mx-auto h-4 w-28 rounded bg-[rgba(245,197,71,0.12)]" />
          <div className="mx-auto h-[min(52vh,420px)] max-w-2xl rounded-2xl border border-[rgba(245,197,71,0.18)] bg-[rgba(255,255,255,0.03)]" />
          <div className="mx-auto flex justify-center gap-3 pt-2">
            <div className="h-9 w-24 rounded-full bg-[rgba(255,255,255,0.05)]" />
            <div className="h-9 w-16 rounded-full bg-[rgba(255,255,255,0.04)]" />
            <div className="h-9 w-24 rounded-full bg-[rgba(255,255,255,0.05)]" />
          </div>
        </div>
      </article>
    </main>
  );
}
