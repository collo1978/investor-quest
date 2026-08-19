"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, DragEvent, ReactNode } from "react";
import { useEffect, useId, useMemo, useState } from "react";

import { BusinessIslandValuePropCardFlip } from "@/components/business/hub/BusinessIslandValuePropCardFlip";
import type { InvestorNotebookQuestionId } from "@/lib/business/businessIslandInvestorNotebook";

type ActivityProps = {
  questionId: InvestorNotebookQuestionId;
  companyName: string;
  onComplete: () => void;
};

const ACTIVITY_QUESTION_IDS = new Set<InvestorNotebookQuestionId>([
  "explain-what-does",
  "explain-value-prop",
  "explain-products",
  "explain-makes-money",
  "explain-customers",
  "explain-where-operates",
  "explain-evolution",
  "explain-future-growth",
  "explain-how-operates",
  "explain-competitive-advantage"
]);

export function hasBusinessIslandMissionActivity(
  questionId: InvestorNotebookQuestionId | undefined
): boolean {
  return questionId ? ACTIVITY_QUESTION_IDS.has(questionId) : false;
}

export function BusinessIslandMissionActivity({
  questionId,
  companyName,
  onComplete
}: ActivityProps) {
  if (questionId === "explain-value-prop") {
    return (
      <BusinessIslandValuePropCardFlip
        companyName={companyName}
        onComplete={onComplete}
      />
    );
  }

  switch (questionId) {
    case "explain-what-does":
      return <NvidiaLogoJigsaw companyName={companyName} onComplete={onComplete} />;
    case "explain-products":
      return <SegmentExplorer companyName={companyName} onComplete={onComplete} />;
    case "explain-makes-money":
      return <MoneyFlow companyName={companyName} onComplete={onComplete} />;
    case "explain-customers":
      return <CustomerExplorer companyName={companyName} onComplete={onComplete} />;
    case "explain-where-operates":
      return <GlobalExplorer companyName={companyName} onComplete={onComplete} />;
    case "explain-evolution":
      return <TimelineExplorer companyName={companyName} onComplete={onComplete} />;
    case "explain-future-growth":
      return <GrowthRunwayScan companyName={companyName} onComplete={onComplete} />;
    case "explain-how-operates":
      return <OperationsConveyor companyName={companyName} onComplete={onComplete} />;
    case "explain-competitive-advantage":
      return <ShieldAssembly companyName={companyName} onComplete={onComplete} />;
    default:
      return null;
  }
}

function ActivityShell({
  title,
  copy,
  progressLabel,
  complete,
  completeLabel,
  onComplete,
  children
}: {
  eyebrow: string;
  title: string;
  copy: string;
  progressLabel: string;
  complete: boolean;
  completeLabel: string;
  onComplete: () => void;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className="iq-learning-activity"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="iq-learning-activity__header">
        <h3 className="iq-learning-activity__title">{title}</h3>
        <p className="iq-learning-activity__copy">{copy}</p>
        <p className="iq-learning-activity__progress">{progressLabel}</p>
      </div>
      {children}
      <button
        type="button"
        className="iq-hq-mission__primary iq-learning-activity__cta"
        disabled={!complete}
        onClick={onComplete}
      >
        {completeLabel}
      </button>
    </motion.section>
  );
}

type JigsawPiece = {
  id: string;
  term: string;
  explanation: string;
  analogy: string;
  slot: number;
  col: number;
  row: number;
  path: string;
};

const NVIDIA_LOGO_PIECES: readonly JigsawPiece[] = [
  {
    id: "gpus",
    term: "GPUs",
    explanation:
      "GPUs are powerful chips that can handle many calculations at the same time. NVIDIA uses them to make graphics, AI and scientific computing run faster.",
    analogy:
      "Like a kitchen with hundreds of cooks working together instead of one cook doing every job.",
    slot: 0,
    col: 0,
    row: 0,
    path:
      "M0 0 H120 V35 C134 35 134 65 120 65 V100 H75 C75 114 45 114 45 100 H0 V0 Z"
  },
  {
    id: "cuda",
    term: "CUDA",
    explanation:
      "CUDA is NVIDIA's software toolkit that helps developers use NVIDIA chips for more than graphics, including AI and data work.",
    analogy:
      "Like giving builders a shared set of tools so they can use a powerful machine without inventing every tool themselves.",
    slot: 1,
    col: 1,
    row: 0,
    path:
      "M0 0 H120 V35 C106 35 106 65 120 65 V100 H75 C75 86 45 86 45 100 H0 V65 C14 65 14 35 0 35 V0 Z"
  },
  {
    id: "accelerated-computing",
    term: "Accelerated Computing",
    explanation:
      "Accelerated computing means using special hardware and software to finish hard computing jobs much faster than ordinary computers.",
    analogy:
      "Like using an express lane for the hardest jobs instead of making every job wait in the same slow line.",
    slot: 2,
    col: 2,
    row: 0,
    path:
      "M0 0 H120 V100 H75 C75 114 45 114 45 100 H0 V65 C-14 65 -14 35 0 35 V0 Z"
  },
  {
    id: "data-center-systems",
    term: "Data Center Systems",
    explanation:
      "Data center systems are the large-scale computers and networking gear that cloud companies use to power AI services.",
    analogy:
      "Like the engine room behind a huge app, doing the heavy work users never see.",
    slot: 3,
    col: 0,
    row: 1,
    path:
      "M0 0 H45 C45 14 75 14 75 0 H120 V35 C106 35 106 65 120 65 V100 H0 V0 Z"
  },
  {
    id: "full-stack-computing",
    term: "Full-Stack Computing",
    explanation:
      "Full-stack computing means NVIDIA offers more than one chip. It combines chips, systems, networking, software and tools into a complete platform.",
    analogy:
      "Like buying the whole game console, controller, online service and game library together instead of separate parts that may not fit.",
    slot: 4,
    col: 1,
    row: 1,
    path:
      "M0 0 H45 C45 -14 75 -14 75 0 H120 V35 C134 35 134 65 120 65 V100 H0 V65 C-14 65 -14 35 0 35 V0 Z"
  },
  {
    id: "ai-software",
    term: "AI Software",
    explanation:
      "AI software helps customers train, run and manage AI models using NVIDIA's hardware and tools.",
    analogy:
      "Like the apps and operating system that make a powerful phone useful instead of just a piece of hardware.",
    slot: 5,
    col: 2,
    row: 1,
    path:
      "M0 0 H45 C45 14 75 14 75 0 H120 V100 H0 V65 C14 65 14 35 0 35 V0 Z"
  }
] as const;

function termLines(term: string): string[] {
  const words = term.split(" ");
  if (words.length <= 1) return [term];
  if (words.length === 2) return words;
  return [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
}

function JigsawPieceSvg({
  piece,
  clipId,
  logo = false,
  empty = false
}: {
  piece: JigsawPiece;
  clipId: string;
  logo?: boolean;
  empty?: boolean;
}) {
  const lines = termLines(piece.term);

  return (
    <svg
      className="iq-nvidia-jigsaw-piece-svg"
      viewBox="0 0 120 100"
      aria-hidden
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={piece.path} />
        </clipPath>
      </defs>
      {logo ? (
        <image
          href="/logos/companies/nvda.svg"
          x={piece.col * -120}
          y={piece.row * -100}
          width="360"
          height="200"
          preserveAspectRatio="none"
          clipPath={`url(#${clipId})`}
        />
      ) : empty ? (
        <path
          d={piece.path}
          className="iq-nvidia-jigsaw-piece-svg__empty-fill"
        />
      ) : (
        <>
          <path
            d={piece.path}
            className="iq-nvidia-jigsaw-piece-svg__fill"
          />
          <g className="iq-nvidia-jigsaw-piece-svg__term">
            {lines.map((line, index) => (
              <text key={line} x="60" y={index === 0 ? 39 : 53}>
                {line}
              </text>
            ))}
          </g>
          <text className="iq-nvidia-jigsaw-piece-svg__question" x="60" y="76">
            ?
          </text>
        </>
      )}
      <path d={piece.path} className="iq-nvidia-jigsaw-piece-svg__stroke" />
    </svg>
  );
}

function NvidiaLogoJigsaw({
  companyName,
  onComplete
}: {
  companyName: string;
  onComplete: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const idPrefix = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [activePieceId, setActivePieceId] = useState<string | null>(null);
  const [explainedIds, setExplainedIds] = useState<readonly string[]>([]);
  const [placedIds, setPlacedIds] = useState<readonly string[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [message, setMessage] = useState(
    "Click a piece to understand the term. Then place it in the puzzle."
  );
  const explainedSet = useMemo(() => new Set(explainedIds), [explainedIds]);
  const placedSet = useMemo(() => new Set(placedIds), [placedIds]);
  const activePiece =
    NVIDIA_LOGO_PIECES.find((piece) => piece.id === activePieceId) ?? null;
  const complete = placedIds.length === NVIDIA_LOGO_PIECES.length;

  useEffect(() => {
    if (!complete) return;
    const t = window.setTimeout(onComplete, 1200);
    return () => window.clearTimeout(t);
  }, [complete, onComplete]);

  const markExplained = (pieceId: string) => {
    setExplainedIds((prev) =>
      prev.includes(pieceId) ? prev : [...prev, pieceId]
    );
    setSelectedPieceId(pieceId);
    setActivePieceId(null);
    setMessage("Now place that piece into its matching puzzle slot.");
  };

  const placePiece = (pieceId: string, slot: number) => {
    const piece = NVIDIA_LOGO_PIECES.find((item) => item.id === pieceId);
    if (!piece || placedSet.has(pieceId)) return;
    if (!explainedSet.has(pieceId)) {
      setActivePieceId(pieceId);
      return;
    }
    if (piece.slot !== slot) {
      setMessage("Not quite — try again.");
      return;
    }
    setPlacedIds((prev) => [...prev, pieceId]);
    setSelectedPieceId(null);
    setMessage("");
  };

  const handleDrop = (slot: number, event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const pieceId = event.dataTransfer.getData("text/plain");
    if (pieceId) placePiece(pieceId, slot);
  };

  return (
    <motion.section
      className="iq-nvidia-jigsaw-game"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      aria-label={`What ${companyName} actually does puzzle`}
    >
      <header className="iq-nvidia-jigsaw-game__header">
        <h3>What does NVIDIA actually do?</h3>
        <p>Click each piece to learn. Then put the pieces together.</p>
        <span>{placedIds.length}/6 pieces placed</span>
      </header>

      <p className="iq-nvidia-jigsaw-game__message" aria-live="polite">
        {complete ? "" : message}
      </p>

      <div className="iq-nvidia-jigsaw-stage">
        <div className="iq-nvidia-jigsaw__board" aria-label="Empty NVIDIA logo puzzle board">
          {NVIDIA_LOGO_PIECES.map((piece, slot) => {
            const placedPiece = NVIDIA_LOGO_PIECES.find(
              (item) => item.slot === slot && placedSet.has(item.id)
            );
            return (
              <button
                key={piece.id}
                type="button"
                className={[
                  "iq-nvidia-jigsaw-slot",
                  placedPiece ? "iq-nvidia-jigsaw-slot--filled" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(slot, event)}
                onClick={() => {
                  if (selectedPieceId) placePiece(selectedPieceId, slot);
                }}
                aria-label={
                  placedPiece
                    ? `${placedPiece.term} placed`
                    : `Empty puzzle slot ${slot + 1}`
                }
              >
                {placedPiece ? (
                  <JigsawPieceSvg
                    piece={placedPiece}
                    clipId={`${idPrefix}-${placedPiece.id}-placed`}
                    logo
                  />
                ) : (
                  <JigsawPieceSvg
                    piece={piece}
                    clipId={`${idPrefix}-${piece.id}-empty`}
                    empty
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="iq-nvidia-jigsaw__pieces" aria-label="Jigsaw pieces">
          {NVIDIA_LOGO_PIECES.map((piece) => {
            const explained = explainedSet.has(piece.id);
            const placed = placedSet.has(piece.id);
            return (
              <button
                key={piece.id}
                type="button"
                className={[
                  "iq-nvidia-jigsaw-piece",
                  explained ? "iq-nvidia-jigsaw-piece--ready" : "",
                  placed ? "iq-nvidia-jigsaw-piece--placed" : "",
                  selectedPieceId === piece.id ? "iq-nvidia-jigsaw-piece--selected" : ""
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={
                  {
                    "--jigsaw-rotation": `${[-8, 6, -5, 7, -7, 5][piece.slot]}deg`
                  } as CSSProperties
                }
                draggable={explained && !placed}
                disabled={placed}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", piece.id);
                  setSelectedPieceId(piece.id);
                }}
                onClick={() => {
                  if (placed) return;
                  if (!explained) {
                    setActivePieceId(piece.id);
                    return;
                  }
                  setSelectedPieceId(piece.id);
                  setMessage("Choose the matching slot on the puzzle board.");
                }}
              >
                <JigsawPieceSvg
                  piece={piece}
                  clipId={`${idPrefix}-${piece.id}-loose`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {activePiece ? (
        <div className="iq-nvidia-jigsaw-modal" role="dialog" aria-modal="true">
          <div className="iq-nvidia-jigsaw-modal__card">
            <p className="iq-nvidia-jigsaw-modal__term">{activePiece.term}</p>
            <p className="iq-nvidia-jigsaw-modal__text">
              {activePiece.explanation}
            </p>
            <div className="iq-nvidia-jigsaw-modal__analogy">
              <span>💡 Think of it like...</span>
              <p>{activePiece.analogy}</p>
            </div>
            <button
              type="button"
              className="iq-hq-mission__primary iq-nvidia-jigsaw-modal__cta"
              onClick={() => markExplained(activePiece.id)}
            >
              GOT IT
            </button>
          </div>
        </div>
      ) : null}
    </motion.section>
  );
}

function SegmentExplorer({
  companyName,
  onComplete
}: {
  companyName: string;
  onComplete: () => void;
}) {
  const products = [
    { id: "h100", label: "AI GPU systems", segment: "data-center" },
    { id: "cuda", label: "CUDA software", segment: "data-center" },
    { id: "geforce", label: "GeForce RTX", segment: "gaming" },
    { id: "omniverse", label: "Omniverse tools", segment: "pro-visual" }
  ] as const;
  const segments = [
    { id: "data-center", label: "Data Center" },
    { id: "gaming", label: "Gaming" },
    { id: "pro-visual", label: "Professional Visualization" }
  ] as const;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<readonly string[]>([]);
  const [message, setMessage] = useState("Select a product, then choose its segment.");
  const matchedSet = useMemo(() => new Set(matchedIds), [matchedIds]);
  const complete = matchedIds.length === products.length;

  const selected = products.find((product) => product.id === selectedId);

  const assignSegment = (segmentId: string) => {
    if (!selected || matchedSet.has(selected.id)) return;
    if (selected.segment !== segmentId) {
      setMessage(`${selected.label} belongs somewhere else. Try another segment.`);
      return;
    }
    setMatchedIds((prev) => [...prev, selected.id]);
    setSelectedId(null);
    setMessage(`${selected.label} locked into ${segments.find((s) => s.id === segmentId)?.label}.`);
  };

  return (
    <ActivityShell
      eyebrow="Segment Explorer"
      title={`Sort ${companyName}'s products`}
      copy="Tap a product crate, then tap the segment it belongs to. This shows how products connect to the business model."
      progressLabel={`${matchedIds.length}/${products.length} products matched`}
      complete={complete}
      completeLabel="Explain the product mix →"
      onComplete={onComplete}
    >
      <p className="iq-learning-activity__hint">{message}</p>
      <div className="iq-segment-explorer">
        <div className="iq-segment-explorer__products">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              className={[
                "iq-segment-product",
                selectedId === product.id ? "iq-segment-product--selected" : "",
                matchedSet.has(product.id) ? "iq-segment-product--matched" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={matchedSet.has(product.id)}
              onClick={() => setSelectedId(product.id)}
            >
              <span>Product crate</span>
              {product.label}
            </button>
          ))}
        </div>
        <div className="iq-segment-explorer__segments">
          {segments.map((segment) => (
            <button
              key={segment.id}
              type="button"
              className="iq-segment-bin"
              onClick={() => assignSegment(segment.id)}
            >
              <span>{segment.label}</span>
              <small>
                {products
                  .filter(
                    (product) =>
                      product.segment === segment.id && matchedSet.has(product.id)
                  )
                  .map((product) => product.label)
                  .join(", ") || "Awaiting match"}
              </small>
            </button>
          ))}
        </div>
      </div>
    </ActivityShell>
  );
}

function CustomerExplorer({
  companyName,
  onComplete
}: {
  companyName: string;
  onComplete: () => void;
}) {
  const customers = [
    {
      id: "clouds",
      label: "Cloud providers",
      detail: "Buy massive AI systems to rent computing power to businesses."
    },
    {
      id: "enterprises",
      label: "Enterprises",
      detail: "Use NVIDIA platforms to build AI tools, analytics and automation."
    },
    {
      id: "gamers-creators",
      label: "Gamers and creators",
      detail: "Buy graphics hardware for games, design and creative workflows."
    },
    {
      id: "automotive",
      label: "Automotive partners",
      detail: "Use NVIDIA chips and software for driving systems and simulations."
    }
  ] as const;
  const [openIds, setOpenIds] = useState<readonly string[]>([]);
  const openSet = useMemo(() => new Set(openIds), [openIds]);

  return (
    <ActivityShell
      eyebrow="Customer Explorer"
      title={`Reveal who buys from ${companyName}`}
      copy="Open each customer door. The point is to see who pays, why they buy and where concentration risk can show up."
      progressLabel={`${openIds.length}/${customers.length} customer groups revealed`}
      complete={openIds.length === customers.length}
      completeLabel="Explain the customer base →"
      onComplete={onComplete}
    >
      <div className="iq-customer-explorer">
        {customers.map((customer) => {
          const open = openSet.has(customer.id);
          return (
            <button
              key={customer.id}
              type="button"
              className={[
                "iq-customer-door",
                open ? "iq-customer-door--open" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() =>
                setOpenIds((prev) =>
                  prev.includes(customer.id) ? prev : [...prev, customer.id]
                )
              }
            >
              <span className="iq-customer-door__label">
                {open ? customer.label : "Mystery customer door"}
              </span>
              <span className="iq-customer-door__detail">
                {open ? customer.detail : "Tap to reveal"}
              </span>
            </button>
          );
        })}
      </div>
    </ActivityShell>
  );
}

function GlobalExplorer({
  companyName,
  onComplete
}: {
  companyName: string;
  onComplete: () => void;
}) {
  const regions = [
    { id: "us", label: "United States", note: "Major customers and AI infrastructure demand." },
    { id: "taiwan", label: "Taiwan", note: "Critical manufacturing partner exposure." },
    { id: "china", label: "China", note: "Large market with export-control risk." },
    { id: "europe", label: "Europe", note: "Enterprise, research and industrial AI demand." }
  ] as const;
  const [visitedIds, setVisitedIds] = useState<readonly string[]>([]);
  const visitedSet = useMemo(() => new Set(visitedIds), [visitedIds]);

  return (
    <ActivityShell
      eyebrow="Global Explorer"
      title={`Map ${companyName}'s global exposure`}
      copy="Tap each region to uncover why geography matters. Investors care because growth, supply and regulation do not all live in one place."
      progressLabel={`${visitedIds.length}/${regions.length} regions explored`}
      complete={visitedIds.length === regions.length}
      completeLabel="Explain global reach →"
      onComplete={onComplete}
    >
      <div className="iq-global-explorer">
        <div className="iq-global-explorer__map">
          {regions.map((region, index) => (
            <button
              key={region.id}
              type="button"
              className={[
                "iq-global-node",
                `iq-global-node--${index + 1}`,
                visitedSet.has(region.id) ? "iq-global-node--visited" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={`Explore ${region.label}`}
              onClick={() =>
                setVisitedIds((prev) =>
                  prev.includes(region.id) ? prev : [...prev, region.id]
                )
              }
            >
              {region.label}
            </button>
          ))}
        </div>
        <div className="iq-global-explorer__intel">
          {regions.map((region) => (
            <p key={region.id}>
              <strong>{region.label}</strong>
              {visitedSet.has(region.id) ? region.note : "Locked until explored."}
            </p>
          ))}
        </div>
      </div>
    </ActivityShell>
  );
}

function TimelineExplorer({
  companyName,
  onComplete
}: {
  companyName: string;
  onComplete: () => void;
}) {
  const ordered = [
    { id: "graphics", label: "Graphics foundation", year: "1990s" },
    { id: "cuda", label: "CUDA expands GPU computing", year: "2006" },
    { id: "ai", label: "AI workloads accelerate demand", year: "2010s" },
    { id: "platform", label: "Full-stack AI infrastructure", year: "Today" }
  ] as const;
  const choices = [ordered[2], ordered[0], ordered[3], ordered[1]] as const;
  const [nextIndex, setNextIndex] = useState(0);
  const [message, setMessage] = useState("Choose the earliest milestone first.");
  const completedIds = new Set(ordered.slice(0, nextIndex).map((event) => event.id));

  const chooseEvent = (eventId: string) => {
    const expected = ordered[nextIndex];
    if (!expected) return;
    if (eventId !== expected.id) {
      setMessage("Not yet. Think about what had to happen first.");
      return;
    }
    setNextIndex((prev) => prev + 1);
    setMessage(`${expected.label} added to the timeline.`);
  };

  return (
    <ActivityShell
      eyebrow="Interactive Timeline"
      title={`Rebuild how ${companyName} evolved`}
      copy="Pick the milestones in chronological order. The goal is to see reinvention, not just a list of dates."
      progressLabel={`${nextIndex}/${ordered.length} milestones placed`}
      complete={nextIndex === ordered.length}
      completeLabel="Explain the evolution →"
      onComplete={onComplete}
    >
      <p className="iq-learning-activity__hint">{message}</p>
      <div className="iq-timeline-activity">
        {choices.map((event) => (
          <button
            key={event.id}
            type="button"
            className={[
              "iq-timeline-card",
              completedIds.has(event.id) ? "iq-timeline-card--placed" : ""
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={completedIds.has(event.id)}
            onClick={() => chooseEvent(event.id)}
          >
            <span>{event.year}</span>
            {event.label}
          </button>
        ))}
      </div>
    </ActivityShell>
  );
}

function OrderedPathActivity({
  eyebrow,
  title,
  copy,
  steps,
  completeLabel,
  onComplete
}: {
  eyebrow: string;
  title: string;
  copy: string;
  steps: readonly { id: string; label: string; detail: string }[];
  completeLabel: string;
  onComplete: () => void;
}) {
  const [nextIndex, setNextIndex] = useState(0);
  const [message, setMessage] = useState("Tap the first step in the flow.");
  const completedIds = new Set(steps.slice(0, nextIndex).map((step) => step.id));

  const chooseStep = (stepId: string) => {
    const expected = steps[nextIndex];
    if (!expected) return;
    if (stepId !== expected.id) {
      setMessage("Close, but the flow starts somewhere else.");
      return;
    }
    setNextIndex((prev) => prev + 1);
    setMessage(`${expected.label} connected.`);
  };

  return (
    <ActivityShell
      eyebrow={eyebrow}
      title={title}
      copy={copy}
      progressLabel={`${nextIndex}/${steps.length} steps connected`}
      complete={nextIndex === steps.length}
      completeLabel={completeLabel}
      onComplete={onComplete}
    >
      <p className="iq-learning-activity__hint">{message}</p>
      <div className="iq-path-activity">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            className={[
              "iq-path-step",
              completedIds.has(step.id) ? "iq-path-step--complete" : "",
              index === nextIndex ? "iq-path-step--next" : ""
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={completedIds.has(step.id)}
            onClick={() => chooseStep(step.id)}
          >
            <span>{index + 1}</span>
            <strong>{step.label}</strong>
            <small>{step.detail}</small>
          </button>
        ))}
      </div>
    </ActivityShell>
  );
}

function MoneyFlow({
  companyName,
  onComplete
}: {
  companyName: string;
  onComplete: () => void;
}) {
  return (
    <OrderedPathActivity
      eyebrow="Money Flow"
      title={`Follow how ${companyName} makes money`}
      copy="Connect the path from customer need to profit. This turns the business model into a flow you can explain."
      steps={[
        { id: "customers", label: "Customers", detail: "Clouds, enterprises, gamers and partners need compute." },
        { id: "products", label: "Products", detail: "They buy GPUs, systems, software and platforms." },
        { id: "revenue", label: "Revenue", detail: "Sales show up in business segments." },
        { id: "costs", label: "Costs", detail: "Manufacturing, research and support use cash." },
        { id: "profit", label: "Profit", detail: "What remains can fund growth or return to owners." }
      ]}
      completeLabel="Explain the money flow →"
      onComplete={onComplete}
    />
  );
}

function OperationsConveyor({
  companyName,
  onComplete
}: {
  companyName: string;
  onComplete: () => void;
}) {
  return (
    <OrderedPathActivity
      eyebrow="Operations Conveyor"
      title={`Run ${companyName}'s operating flow`}
      copy="Tap the steps in order from idea to delivery. This shows where execution risk lives."
      steps={[
        { id: "design", label: "Design", detail: "NVIDIA engineers the chips and platforms." },
        { id: "foundry", label: "Foundry partners", detail: "Specialist manufacturers produce the chips." },
        { id: "package", label: "Assembly", detail: "Components are packaged into usable systems." },
        { id: "ship", label: "Distribution", detail: "Products move through partners and channels." },
        { id: "support", label: "Customer support", detail: "Engineers help customers get value." }
      ]}
      completeLabel="Explain operations →"
      onComplete={onComplete}
    />
  );
}

function ShieldAssembly({
  companyName,
  onComplete
}: {
  companyName: string;
  onComplete: () => void;
}) {
  const pieces = [
    { id: "performance", label: "Performance", detail: "Fast hardware helps win demanding workloads." },
    { id: "cuda", label: "CUDA", detail: "Developer habits make switching harder." },
    { id: "ecosystem", label: "Ecosystem", detail: "Tools, partners and developers reinforce the platform." },
    { id: "scale", label: "Scale", detail: "Large demand funds more research and supply access." }
  ] as const;
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  return (
    <ActivityShell
      eyebrow="Shield Assembly"
      title={`Assemble ${companyName}'s competitive shield`}
      copy="Add the pieces that protect the business. Then you will explain the moat and what could weaken it."
      progressLabel={`${selectedIds.length}/${pieces.length} shield pieces installed`}
      complete={selectedIds.length === pieces.length}
      completeLabel="Explain the moat →"
      onComplete={onComplete}
    >
      <div className="iq-shield-assembly">
        <div className="iq-shield-assembly__core">
          <span>{selectedIds.length === pieces.length ? "Shield online" : "Shield building"}</span>
        </div>
        <div className="iq-shield-assembly__pieces">
          {pieces.map((piece) => (
            <button
              key={piece.id}
              type="button"
              className={[
                "iq-shield-piece",
                selectedSet.has(piece.id) ? "iq-shield-piece--selected" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() =>
                setSelectedIds((prev) =>
                  prev.includes(piece.id) ? prev : [...prev, piece.id]
                )
              }
            >
              <strong>{piece.label}</strong>
              <small>{piece.detail}</small>
            </button>
          ))}
        </div>
      </div>
    </ActivityShell>
  );
}

function GrowthRunwayScan({
  companyName,
  onComplete
}: {
  companyName: string;
  onComplete: () => void;
}) {
  const opportunities = [
    { id: "ai-factories", label: "AI factories", answer: "growth", detail: "Large customers are still building AI capacity." },
    { id: "software", label: "Enterprise software", answer: "growth", detail: "Software can make revenue more repeatable." },
    { id: "hype", label: "Unproven hype", answer: "proof", detail: "Big claims need real customer spending." },
    { id: "autos", label: "Autonomous vehicles", answer: "proof", detail: "Large potential, but adoption timing is uncertain." }
  ] as const;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const correct = opportunities.filter((item) => answers[item.id] === item.answer).length;

  return (
    <ActivityShell
      eyebrow="Growth Runway Scan"
      title={`Sort ${companyName}'s future opportunities`}
      copy="Decide which opportunities look like clearer growth bets and which need more proof. Investors should separate runway from hype."
      progressLabel={`${correct}/${opportunities.length} opportunities sorted`}
      complete={correct === opportunities.length}
      completeLabel="Explain future growth →"
      onComplete={onComplete}
    >
      <div className="iq-growth-scan">
        {opportunities.map((item) => (
          <div key={item.id} className="iq-growth-card">
            <strong>{item.label}</strong>
            <p>{item.detail}</p>
            <div className="iq-growth-card__actions">
              <button
                type="button"
                className={answers[item.id] === "growth" ? "is-selected" : ""}
                onClick={() => setAnswers((prev) => ({ ...prev, [item.id]: "growth" }))}
              >
                Growth bet
              </button>
              <button
                type="button"
                className={answers[item.id] === "proof" ? "is-selected" : ""}
                onClick={() => setAnswers((prev) => ({ ...prev, [item.id]: "proof" }))}
              >
                Needs proof
              </button>
            </div>
          </div>
        ))}
      </div>
    </ActivityShell>
  );
}
