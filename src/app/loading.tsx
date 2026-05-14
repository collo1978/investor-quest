export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-14">
      <div className="rounded-2xl border border-panel-border bg-panel p-6 shadow-glow backdrop-blur-xl">
        <div className="h-3 w-28 animate-pulse rounded-full bg-[rgba(255,255,255,0.10)]" />
        <div className="mt-4 h-6 w-56 animate-pulse rounded-full bg-[rgba(255,255,255,0.10)]" />
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.03)]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}

