/** Inline placeholder while BusinessIslandQuestReading chunk loads. */
export function BusinessQuestReadingSkeleton() {
  return (
    <div
      className="pointer-events-none animate-pulse px-5 py-8 sm:px-6 md:px-9"
      aria-busy="true"
      aria-label="Loading quest cards"
    >
      <div className="mx-auto h-4 w-32 rounded bg-[rgba(245,197,71,0.14)]" />
      <div className="mx-auto mt-6 h-[min(48vh,380px)] max-w-2xl rounded-2xl border border-[rgba(245,197,71,0.16)] bg-[rgba(255,255,255,0.03)]" />
      <div className="mx-auto mt-6 flex justify-center gap-3">
        <div className="h-9 w-24 rounded-full bg-[rgba(255,255,255,0.05)]" />
        <div className="h-9 w-16 rounded-full bg-[rgba(255,255,255,0.04)]" />
        <div className="h-9 w-24 rounded-full bg-[rgba(255,255,255,0.05)]" />
      </div>
    </div>
  );
}
