import Link from "next/link";

export default function DashboardHubPage() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-white/65">
        Choose a segment-specific dashboard. Data is demo-only until the
        analytics ingest service is connected.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            href: "/dashboard/school",
            title: "Schools",
            body: "Student progress, quiz scores, completion rates."
          },
          {
            href: "/dashboard/bank",
            title: "Banks",
            body: "Education engagement, confidence journey (planned signals)."
          },
          {
            href: "/dashboard/broker",
            title: "Brokers",
            body: "Investor engagement, quest completion, retention signals."
          }
        ].map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-[var(--partner-primary)]/40 hover:bg-white/[0.07]"
          >
            <div className="text-lg font-semibold text-white">{c.title}</div>
            <p className="mt-2 text-sm text-white/65">{c.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
