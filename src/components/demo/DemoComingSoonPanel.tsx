"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Props = {
  title: string;
  message: string;
  backHref: string;
  backLabel?: string;
};

/** Premium empty state for demo areas that are not player-ready yet. */
export function DemoComingSoonPanel({
  title,
  message,
  backHref,
  backLabel = "Go back"
}: Props) {
  return (
    <motion.div
      className="mx-auto flex min-h-[min(72vh,640px)] max-w-lg flex-col items-center justify-center px-5 py-12 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        className="relative w-full overflow-hidden rounded-3xl border border-violet-400/25 bg-[rgba(12,10,24,0.72)] px-6 py-10 shadow-[0_0_48px_-12px_rgba(139,92,246,0.35)] backdrop-blur-xl sm:px-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(168,85,247,0.18),transparent_60%)]"
        />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.28em] text-violet-300/90">
          Coming soon
        </p>
        <h1 className="relative mt-3 font-[var(--font-grotesk)] text-2xl text-ink-0 sm:text-[1.65rem]">
          {title}
        </h1>
        <p className="relative mt-4 text-[14px] leading-relaxed text-ink-1/95">
          {message}
        </p>
        <Link
          href={backHref}
          className="relative mt-8 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-violet-400/40 bg-violet-500/10 px-5 py-2.5 text-sm font-semibold text-violet-200 transition hover:border-violet-300/55 hover:bg-violet-500/16 hover:text-violet-100"
        >
          {backLabel}
        </Link>
      </motion.div>
    </motion.div>
  );
}
