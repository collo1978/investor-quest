"use client";

import { motion, useReducedMotion } from "framer-motion";

const PROGRESS_ITEMS = [
  {
    title: "Build real research skills",
    body: "Learn how investors read earnings, spot trends, and build conviction."
  },
  {
    title: "Unlock investor armor",
    body: "Level up through quests — each win adds gear to your profile."
  },
  {
    title: "Become a legendary investor",
    body: "Climb the ranks, master the map, and prove your edge."
  }
] as const;

/** Tablet-only progression panel — world-building copy absent on phone. */
export function SchoolsAvatarProgressPanel() {
  const reduceMotion = useReducedMotion();

  return (
    <aside
      className="relative flex w-[min(17.5rem,34vw)] shrink-0 flex-col justify-center border-r border-violet-500/15 px-6 py-8"
      aria-label="Your investor journey"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_320px_at_20%_40%,rgba(139,92,246,0.14),transparent_70%)]"
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <p className="text-[0.62rem] font-black uppercase tracking-[0.38em] text-violet-300/75">
          Your mission
        </p>
        <h2 className="iq-schools-armor-title mt-3 text-lg font-black uppercase leading-tight tracking-[0.12em] text-violet-50 sm:text-xl">
          Rise up the investor ranks
        </h2>
      </motion.div>

      <ul className="relative mt-8 space-y-5">
        {PROGRESS_ITEMS.map((item, i) => (
          <motion.li
            key={item.title}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="flex gap-3"
          >
            <span
              aria-hidden
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.65)]"
            />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-violet-100/92">
                {item.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-violet-100/62">{item.body}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </aside>
  );
}
