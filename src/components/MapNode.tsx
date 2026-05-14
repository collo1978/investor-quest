"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function MapNode({
  title,
  subtitle,
  href,
  locked,
  activeGlow,
  rightAlign,
  progressLabel,
  children
}: {
  title: string;
  subtitle: string;
  href: string;
  locked: boolean;
  activeGlow?: boolean;
  rightAlign?: boolean;
  progressLabel: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={["relative", rightAlign ? "md:justify-self-end" : ""].join(" ")}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={[
          "relative w-full max-w-[520px] rounded-2xl border backdrop-blur-xl",
          "bg-[rgba(255,255,255,0.05)]",
          locked
            ? "border-panel-border opacity-70"
            : "border-[rgba(139,92,246,0.35)] shadow-glow"
        ].join(" ")}
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[rgba(139,92,246,0.12)] via-transparent to-[rgba(59,130,246,0.06)]" />

        {activeGlow && !locked ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-[2px] rounded-2xl"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.55), rgba(168,85,247,0.35), rgba(59,130,246,0.25))",
              filter: "blur(10px)"
            }}
          />
        ) : null}

        <div className="relative p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-semibold text-ink-0">{title}</div>
                {locked ? (
                  <span className="rounded-full border border-panel-border bg-panel px-2 py-0.5 text-xs text-ink-2">
                    Locked
                  </span>
                ) : (
                  <span className="rounded-full border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.10)] px-2 py-0.5 text-xs text-neon-300">
                    Unlocked
                  </span>
                )}
              </div>
              <div className="mt-2 text-sm text-ink-1">{subtitle}</div>
            </div>

            <Link
              href={locked ? "#" : href}
              aria-disabled={locked}
              className={[
                "rounded-xl border px-3 py-2 text-sm transition",
                locked
                  ? "cursor-not-allowed border-panel-border bg-[rgba(255,255,255,0.03)] text-ink-2"
                  : "border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.10)] text-neon-300 hover:bg-[rgba(139,92,246,0.16)]"
              ].join(" ")}
            >
              Enter
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-xs text-ink-2">{progressLabel}</div>
            {!locked ? (
              <div className="flex items-center gap-2 text-xs text-neon-300">
                <span className="h-1.5 w-1.5 rounded-full bg-neon-400 shadow-[0_0_14px_rgba(139,92,246,0.85)]" />
                Track online
              </div>
            ) : (
              <div className="text-xs text-ink-2">Complete previous pillar</div>
            )}
          </div>

          {children ? <div className="mt-4">{children}</div> : null}
        </div>
      </motion.div>
    </div>
  );
}

