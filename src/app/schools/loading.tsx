/** Instant feedback while Schools routes compile / hydrate. */
export default function SchoolsLoading() {
  return (
    <div
      className="flex min-h-[min(52vh,420px)] w-full items-center justify-center py-16"
      aria-busy="true"
      aria-label="Loading Schools screen"
    >
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-amber-400/25 border-t-amber-300/90"
        aria-hidden
      />
    </div>
  );
}
