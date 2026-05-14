"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

type QuizState = {
  attempts: number;
  bestScore: number;
  streak: number;
  lastPlayedAt: number;
};

type BoardState = {
  bull: string[];
  base: string[];
  bear: string[];
  conviction: number;
  lastPlayedAt: number;
};

type TerminalState = {
  revenueGrowth: number;
  margin: number;
  discountRate: number;
  score: number;
  lastPlayedAt: number;
};

export function QuestMiniGames({
  title,
  mini,
  onPatchMini,
  onBonusXp,
  onTouchStreak
}: {
  title: string;
  mini: {
    quiz?: QuizState;
    board?: BoardState;
    terminal?: TerminalState;
  } | null | undefined;
  onPatchMini: (patch: { quiz?: QuizState; board?: BoardState; terminal?: TerminalState }) => void;
  onBonusXp: (amount: number, reason: string) => void;
  onTouchStreak: () => void;
}) {
  const [tab, setTab] = useState<"quiz" | "board" | "terminal">("quiz");

  return (
    <div className="rounded-2xl border border-panel-border bg-panel p-4 shadow-glow">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs text-ink-2">Play</div>
          <div className="mt-1 text-sm font-semibold text-ink-0">
            Mini-games for: {title}
          </div>
        </div>

        <div className="flex gap-2">
          <TabButton active={tab === "quiz"} onClick={() => setTab("quiz")}>
            Quiz
          </TabButton>
          <TabButton active={tab === "board"} onClick={() => setTab("board")}>
            Thesis board
          </TabButton>
          <TabButton active={tab === "terminal"} onClick={() => setTab("terminal")}>
            Terminal
          </TabButton>
        </div>
      </div>

      <div className="mt-4">
        {tab === "quiz" ? (
          <DuolingoQuiz
            mini={mini?.quiz}
            onPatch={(q) => onPatchMini({ quiz: q })}
            onBonusXp={onBonusXp}
            onTouchStreak={onTouchStreak}
          />
        ) : null}
        {tab === "board" ? (
          <ThesisBoard
            mini={mini?.board}
            onPatch={(b) => onPatchMini({ board: b })}
            onBonusXp={onBonusXp}
            onTouchStreak={onTouchStreak}
          />
        ) : null}
        {tab === "terminal" ? (
          <BloombergTerminal
            mini={mini?.terminal}
            onPatch={(t) => onPatchMini({ terminal: t })}
            onBonusXp={onBonusXp}
            onTouchStreak={onTouchStreak}
          />
        ) : null}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border px-3 py-2 text-xs font-semibold transition",
        active
          ? "border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.12)] text-neon-300 shadow-glow"
          : "border-panel-border bg-[rgba(255,255,255,0.03)] text-ink-1 hover:bg-[rgba(255,255,255,0.06)]"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function DuolingoQuiz({
  mini,
  onPatch,
  onBonusXp,
  onTouchStreak
}: {
  mini?: QuizState;
  onPatch: (q: QuizState) => void;
  onBonusXp: (amount: number, reason: string) => void;
  onTouchStreak: () => void;
}) {
  const questions = useMemo(
    () => [
      {
        q: "Which pillar best answers: “How does this company make money?”",
        options: ["Forces", "Business", "Management", "Financials"],
        a: 1
      },
      {
        q: "A moat scorecard is most aligned with…",
        options: ["Business", "Forces", "Financials", "Management"],
        a: 0
      },
      {
        q: "Tracking margins and cash flow durability fits…",
        options: ["Management", "Forces", "Business", "Financials"],
        a: 3
      }
    ],
    []
  );

  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    let ok = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].a) ok++;
    }
    return ok / questions.length;
  }, [answers, questions]);

  const stats = mini ?? { attempts: 0, bestScore: 0, streak: 0, lastPlayedAt: 0 };
  const stars = Math.round(score * 3);

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <Stat label="Best" value={`${Math.round((stats.bestScore ?? 0) * 100)}%`} />
        <Stat label="Streak" value={`${stats.streak ?? 0}`} />
        <Stat label="Attempts" value={`${stats.attempts ?? 0}`} />
      </div>

      <div className="rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.03)] p-4">
        <div className="mb-3 text-xs text-ink-2">Quick check (Duolingo-style)</div>
        <div className="grid gap-4">
          {questions.map((qq, idx) => (
            <div key={idx} className="rounded-2xl border border-panel-border bg-[rgba(0,0,0,0.16)] p-3">
              <div className="text-sm font-semibold text-ink-0">{qq.q}</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {qq.options.map((opt, oi) => {
                  const selected = answers[idx] === oi;
                  const correct = submitted && oi === qq.a;
                  const wrong = submitted && selected && oi !== qq.a;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        if (submitted) return;
                        setAnswers((a) => {
                          const next = [...a];
                          next[idx] = oi;
                          return next;
                        });
                      }}
                      className={[
                        "rounded-xl border px-3 py-2 text-xs font-semibold transition",
                        selected
                          ? "border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.12)] text-neon-300"
                          : "border-panel-border bg-[rgba(255,255,255,0.03)] text-ink-1 hover:bg-[rgba(255,255,255,0.06)]",
                        correct ? "shadow-[0_0_18px_rgba(34,197,94,0.20)]" : "",
                        wrong ? "shadow-[0_0_18px_rgba(239,68,68,0.18)]" : ""
                      ].join(" ")}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-ink-2">
            Stars:{" "}
            <span className="text-ink-0 font-semibold">{submitted ? stars : "—"}</span>{" "}
            <span className="text-ink-2">·</span>{" "}
            Score:{" "}
            <span className="text-ink-0 font-semibold">
              {submitted ? `${Math.round(score * 100)}%` : "—"}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setAnswers(Array(questions.length).fill(-1));
                setSubmitted(false);
              }}
              className="rounded-xl border border-panel-border bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-semibold text-ink-1 transition hover:bg-[rgba(255,255,255,0.06)]"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => {
                const now = Date.now();
                const nextBest = Math.max(stats.bestScore ?? 0, score);
                const nextStreak =
                  score >= 0.67 ? (stats.streak ?? 0) + 1 : 0;
                onPatch({
                  attempts: (stats.attempts ?? 0) + 1,
                  bestScore: nextBest,
                  streak: nextStreak,
                  lastPlayedAt: now
                });
                // Bonus XP: stars * 15, only if decent score.
                if (score >= 0.34) {
                  onBonusXp(Math.max(10, Math.round(stars * 15)), "Mini-game: Quiz performance");
                }
                if (score >= 0.67) onTouchStreak();
                setSubmitted(true);
              }}
              className="rounded-xl border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.14)] px-3 py-2 text-xs font-semibold text-neon-300 shadow-glow transition hover:bg-[rgba(139,92,246,0.20)]"
            >
              Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThesisBoard({
  mini,
  onPatch,
  onBonusXp,
  onTouchStreak
}: {
  mini?: BoardState;
  onPatch: (b: BoardState) => void;
  onBonusXp: (amount: number, reason: string) => void;
  onTouchStreak: () => void;
}) {
  const seedSignals = useMemo(
    () => [
      "Ecosystem lock‑in",
      "Pricing power",
      "Unit growth deceleration",
      "Regulatory risk",
      "Services margin expansion",
      "Supply chain concentration"
    ],
    []
  );

  const state =
    mini ?? {
      bull: [],
      base: [],
      bear: [],
      conviction: 0,
      lastPlayedAt: 0
    };

  const pool = seedSignals.filter(
    (s) => !state.bull.includes(s) && !state.base.includes(s) && !state.bear.includes(s)
  );

  const conviction = useMemo(() => {
    // Bull adds, Bear subtracts, Base dampens.
    const raw = 50 + state.bull.length * 12 - state.bear.length * 14 - state.base.length * 2;
    return Math.max(0, Math.min(100, raw));
  }, [state.bear.length, state.base.length, state.bull.length]);

  useEffect(() => {
    // Award XP on meaningful board changes (simple heuristic)
    if (state.lastPlayedAt <= 0) return;
    onTouchStreak();
    if (conviction >= 70) onBonusXp(25, "Mini-game: Thesis board (high conviction)");
    else if (conviction >= 55) onBonusXp(15, "Mini-game: Thesis board (updated)");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conviction]);

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <Stat label="Conviction" value={`${conviction}/100`} />
        <Stat label="Bull signals" value={`${state.bull.length}`} />
        <Stat label="Bear signals" value={`${state.bear.length}`} />
      </div>

      <div className="rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.03)] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-xs text-ink-2">Strategy board (drag & drop)</div>
          <button
            type="button"
            onClick={() =>
              onPatch({ bull: [], base: [], bear: [], conviction: 0, lastPlayedAt: Date.now() })
            }
            className="rounded-xl border border-panel-border bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-semibold text-ink-1 transition hover:bg-[rgba(255,255,255,0.06)]"
          >
            Clear
          </button>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-panel-border bg-[rgba(0,0,0,0.14)] p-3">
            <div className="text-xs text-ink-2">Signal deck</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {pool.map((s) => (
                <DraggableChip key={s} value={s} />
              ))}
              {pool.length === 0 ? (
                <div className="text-xs text-ink-2">All signals placed.</div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <DropZone
              title="Bull"
              hint="Catalysts / moats"
              items={state.bull}
              onDrop={(val) => {
                const next = { ...state, bull: [...state.bull, val], lastPlayedAt: Date.now() };
                onPatch({ ...next, conviction });
              }}
              onRemove={(val) => {
                const next = { ...state, bull: state.bull.filter((x) => x !== val), lastPlayedAt: Date.now() };
                onPatch({ ...next, conviction });
              }}
              tone="from-[rgba(34,197,94,0.18)] to-transparent"
            />
            <DropZone
              title="Base"
              hint="Neutral / watch"
              items={state.base}
              onDrop={(val) => {
                const next = { ...state, base: [...state.base, val], lastPlayedAt: Date.now() };
                onPatch({ ...next, conviction });
              }}
              onRemove={(val) => {
                const next = { ...state, base: state.base.filter((x) => x !== val), lastPlayedAt: Date.now() };
                onPatch({ ...next, conviction });
              }}
              tone="from-[rgba(59,130,246,0.16)] to-transparent"
            />
            <DropZone
              title="Bear"
              hint="Risks / threats"
              items={state.bear}
              onDrop={(val) => {
                const next = { ...state, bear: [...state.bear, val], lastPlayedAt: Date.now() };
                onPatch({ ...next, conviction });
              }}
              onRemove={(val) => {
                const next = { ...state, bear: state.bear.filter((x) => x !== val), lastPlayedAt: Date.now() };
                onPatch({ ...next, conviction });
              }}
              tone="from-[rgba(239,68,68,0.18)] to-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-[11px] text-ink-2">
            <div>Conviction meter</div>
            <div>{conviction}%</div>
          </div>
          <div className="relative h-2.5 overflow-hidden rounded-full border border-panel-border bg-[rgba(255,255,255,0.03)]">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              initial={false}
              animate={{ width: `${conviction}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background:
                  "linear-gradient(90deg, rgba(139,92,246,0.20), rgba(139,92,246,0.70), rgba(34,197,94,0.55))",
                boxShadow: "0 0 22px rgba(139,92,246,0.25)"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BloombergTerminal({
  mini,
  onPatch,
  onBonusXp,
  onTouchStreak
}: {
  mini?: TerminalState;
  onPatch: (t: TerminalState) => void;
  onBonusXp: (amount: number, reason: string) => void;
  onTouchStreak: () => void;
}) {
  const state =
    mini ?? {
      revenueGrowth: 8,
      margin: 28,
      discountRate: 9,
      score: 50,
      lastPlayedAt: 0
    };

  const score = useMemo(() => {
    // Toy scoring: higher growth/margin better, higher discount worse.
    const g = (state.revenueGrowth + 10) / 30; // 0..1
    const m = (state.margin - 5) / 40; // 0..1
    const d = 1 - (state.discountRate - 6) / 8; // 0..1
    const s = (g * 0.38 + m * 0.42 + d * 0.20) * 100;
    return Math.max(0, Math.min(100, s));
  }, [state.discountRate, state.margin, state.revenueGrowth]);

  function commit(next: TerminalState) {
    // score must be computed from the next values (not the previous state)
    const g = (next.revenueGrowth + 10) / 30;
    const m = (next.margin - 5) / 40;
    const d = 1 - (next.discountRate - 6) / 8;
    const nextScore = Math.max(0, Math.min(100, (g * 0.38 + m * 0.42 + d * 0.20) * 100));
    onPatch({ ...next, score: nextScore, lastPlayedAt: Date.now() });
    onTouchStreak();
    if (nextScore >= 75) onBonusXp(25, "Mini-game: Terminal (strong signal score)");
    else if (nextScore >= 60) onBonusXp(12, "Mini-game: Terminal (signal updated)");
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <Stat label="Signal score" value={`${Math.round(score)}/100`} />
        <Stat label="Growth" value={`${state.revenueGrowth}%`} />
        <Stat label="Margin" value={`${state.margin}%`} />
      </div>

      <div className="rounded-2xl border border-panel-border bg-[rgba(0,0,0,0.18)] p-4">
        <div className="mb-3 text-xs text-ink-2">
          Terminal simulator (Bloomberg-like sliders)
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Slider
            label="Revenue growth (5y)"
            value={state.revenueGrowth}
            min={-10}
            max={20}
            unit="%"
            onChange={(v) => commit({ ...state, revenueGrowth: v })}
          />
          <Slider
            label="Operating margin"
            value={state.margin}
            min={5}
            max={45}
            unit="%"
            onChange={(v) => commit({ ...state, margin: v })}
          />
          <Slider
            label="Discount rate"
            value={state.discountRate}
            min={6}
            max={14}
            unit="%"
            onChange={(v) => commit({ ...state, discountRate: v })}
          />
          <div className="rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.03)] p-3">
            <div className="text-[11px] text-ink-2">Model output</div>
            <div className="mt-2 font-[var(--font-grotesk)] text-2xl text-ink-0">
              {Math.round(score)}
            </div>
            <div className="mt-1 text-xs text-ink-2">
              Composite signal quality (toy model).
            </div>
            <div className="mt-3 text-xs text-ink-1">
              Terminal hint: high margin + stable discount tends to score higher.
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-[11px] text-ink-2">
            <div>Signal bar</div>
            <div>{Math.round(score)}%</div>
          </div>
          <div className="relative h-2.5 overflow-hidden rounded-full border border-panel-border bg-[rgba(255,255,255,0.03)]">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              initial={false}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background:
                  "linear-gradient(90deg, rgba(59,130,246,0.20), rgba(139,92,246,0.70), rgba(168,85,247,0.60))",
                boxShadow: "0 0 22px rgba(139,92,246,0.22)"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  unit,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.03)] p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold text-ink-0">{label}</div>
        <div className="text-xs text-neon-300">
          {value}
          {unit}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[#8B5CF6]"
      />
      <div className="mt-2 flex items-center justify-between text-[11px] text-ink-2">
        <div>
          {min}
          {unit}
        </div>
        <div>
          {max}
          {unit}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-panel-border bg-[rgba(255,255,255,0.03)] px-3 py-2">
      <div className="text-[11px] text-ink-2">{label}</div>
      <div className="mt-1 text-sm font-semibold text-ink-0">{value}</div>
    </div>
  );
}

function DraggableChip({ value }: { value: string }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", value);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="cursor-grab rounded-xl border border-panel-border bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-semibold text-ink-1 transition active:cursor-grabbing hover:bg-[rgba(255,255,255,0.06)]"
    >
      {value}
    </div>
  );
}

function DropZone({
  title,
  hint,
  items,
  onDrop,
  onRemove,
  tone
}: {
  title: string;
  hint: string;
  items: string[];
  onDrop: (val: string) => void;
  onRemove: (val: string) => void;
  tone: string;
}) {
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        const val = e.dataTransfer.getData("text/plain");
        if (!val) return;
        if (items.includes(val)) return;
        onDrop(val);
      }}
      className="rounded-2xl border border-panel-border bg-[rgba(0,0,0,0.14)] p-3"
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-ink-0">{title}</div>
        <div className="text-[11px] text-ink-2">{hint}</div>
      </div>
      <div className={["mt-2 rounded-xl border border-panel-border bg-gradient-to-b p-2", tone].join(" ")}>
        <div className="flex flex-wrap gap-2">
          {items.map((it) => (
            <button
              key={it}
              type="button"
              onClick={() => onRemove(it)}
              className="rounded-xl border border-panel-border bg-[rgba(255,255,255,0.03)] px-2.5 py-1.5 text-xs font-semibold text-ink-1 transition hover:bg-[rgba(255,255,255,0.06)]"
              title="Click to remove"
            >
              {it}
            </button>
          ))}
          {items.length === 0 ? (
            <div className="text-[11px] text-ink-2">Drop signals here</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

