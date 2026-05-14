"use client";

import { motion } from "framer-motion";

export function QuestDots({
  quests,
  locked
}: {
  quests: { title: string; xp: number; done: boolean }[];
  locked: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {quests.map((q, i) => {
        const done = q.done;
        const base =
          "group relative inline-flex h-2.5 w-2.5 items-center justify-center rounded-full border transition-shadow focus:outline-none focus:ring-2 focus:ring-neon-400/60";
        const cls = locked
          ? "border-panel-border bg-[rgba(255,255,255,0.03)]"
          : done
            ? "border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.55)] shadow-[0_0_16px_rgba(139,92,246,0.55)]"
            : "border-panel-border bg-[rgba(255,255,255,0.04)]";

        const tooltipId = `quest-dot-${i}`;
        return (
          <div key={i} className="relative">
            <motion.button
              type="button"
              disabled={locked}
              className={[base, cls].join(" ")}
              initial={false}
              animate={!locked && done ? { scale: [1, 1.25, 1] } : { scale: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              aria-label={`${q.title}. ${done ? "Completed" : "Pending"}. Reward ${q.xp} XP.`}
              aria-describedby={!locked ? tooltipId : undefined}
            />

            {/* tooltip */}
            {!locked ? (
              <div
                id={tooltipId}
                role="tooltip"
                className="pointer-events-none absolute left-1/2 top-[-10px] z-10 hidden -translate-x-1/2 -translate-y-full group-hover:block group-focus-within:block"
              >
                <div className="whitespace-nowrap rounded-lg border border-panel-border bg-[rgba(7,7,18,0.95)] px-2.5 py-1.5 text-xs text-ink-1 shadow-glow">
                  <span className="text-ink-0">{q.title}</span>{" "}
                  <span className="text-ink-2">·</span>{" "}
                  <span className="text-neon-300">+{q.xp} XP</span>{" "}
                  <span className="text-ink-2">·</span>{" "}
                  <span className={done ? "text-neon-300" : "text-ink-2"}>
                    {done ? "Done" : "Pending"}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

