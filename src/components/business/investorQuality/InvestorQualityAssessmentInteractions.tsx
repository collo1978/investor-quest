"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";

import type { InvestorQualityAssessmentStyle } from "@/lib/business/investorQualityChecklist";
import type { InvestorQualityRatingValue } from "@/lib/business/investorQualityChecklist";

type ControlProps = {
  itemLabel: string;
  evidenceCount: number;
  value: InvestorQualityRatingValue | undefined;
  onSelect: (value: InvestorQualityRatingValue) => void;
};

function useJudgmentSelect(onSelect: (value: InvestorQualityRatingValue) => void) {
  const reduceMotion = useReducedMotion();
  const [flashValue, setFlashValue] = useState<InvestorQualityRatingValue | null>(
    null
  );

  const select = useCallback(
    (value: InvestorQualityRatingValue) => {
      onSelect(value);
      if (reduceMotion) return;
      setFlashValue(value);
      window.setTimeout(() => setFlashValue(null), 560);
    },
    [onSelect, reduceMotion]
  );

  return { flashValue, select, reduceMotion };
}

function verdictCardClass(
  kind: "strong" | "weak",
  active: boolean,
  flashing: boolean
): string {
  return [
    "iq-investor-quality-assessment__verdict-card",
    `iq-investor-quality-assessment__verdict-card--${kind}`,
    active ? "iq-investor-quality-assessment__verdict-card--active" : "",
    flashing ? "iq-investor-quality-assessment__verdict-card--flash" : ""
  ]
    .filter(Boolean)
    .join(" ");
}

function ThumbJudgmentButton({
  kind,
  value,
  flashValue,
  reduceMotion,
  onSelect
}: {
  kind: "strong" | "weak";
  value: InvestorQualityRatingValue | undefined;
  flashValue: InvestorQualityRatingValue | null;
  reduceMotion: boolean | null;
  onSelect: (value: InvestorQualityRatingValue) => void;
}) {
  const rating = kind === "strong" ? "yes" : "no";
  const active = value === rating;
  const flashing = flashValue === rating;

  return (
    <motion.button
      type="button"
      role="radio"
      aria-label={kind === "strong" ? "Strong" : "Weak"}
      aria-checked={active}
      className={verdictCardClass(kind, active, flashing)}
      whileHover={reduceMotion ? undefined : { y: -12, scale: 1.045 }}
      whileTap={reduceMotion ? undefined : { scale: 0.9, y: 3 }}
      animate={
        active && !reduceMotion ? { scale: [1, 1.07, 1.04], y: -4 } : { scale: 1, y: 0 }
      }
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
      onClick={() => onSelect(rating)}
    >
      <span className="iq-investor-quality-assessment__verdict-aura" aria-hidden />
      <span className="iq-investor-quality-assessment__verdict-rim" aria-hidden />
      <span className="iq-investor-quality-assessment__verdict-pulse" aria-hidden />
      <span className="iq-investor-quality-assessment__verdict-thumb" aria-hidden>
        {kind === "strong" ? "👍" : "👎"}
      </span>
    </motion.button>
  );
}

function BinaryThumbJudgmentControl({ itemLabel, value, onSelect }: ControlProps) {
  const { flashValue, select, reduceMotion } = useJudgmentSelect(onSelect);

  return (
    <div
      className="iq-investor-quality-assessment iq-investor-quality-assessment--verdict iq-investor-quality-assessment--icon-only"
      role="radiogroup"
      aria-label={`${itemLabel} verdict`}
    >
      <ThumbJudgmentButton
        kind="strong"
        value={value}
        flashValue={flashValue}
        reduceMotion={reduceMotion}
        onSelect={select}
      />
      <ThumbJudgmentButton
        kind="weak"
        value={value}
        flashValue={flashValue}
        reduceMotion={reduceMotion}
        onSelect={select}
      />
    </div>
  );
}

function VerdictControl(props: ControlProps) {
  return <BinaryThumbJudgmentControl {...props} />;
}

function SliderControl({ itemLabel, value, onSelect }: ControlProps) {
  const { select } = useJudgmentSelect(onSelect);
  const [sliderValue, setSliderValue] = useState(
    value === "yes" ? 72 : value === "no" ? 28 : 50
  );

  const commit = useCallback(
    (next: number) => {
      setSliderValue(next);
      select(next >= 50 ? "yes" : "no");
    },
    [select]
  );

  const leaning = sliderValue >= 50 ? "strong" : "weak";

  return (
    <div className="iq-investor-quality-assessment iq-investor-quality-assessment--slider">
      <p className="iq-investor-quality-assessment__slider-hint">
        Slide to your confidence level
      </p>
      <div
        className={[
          "iq-investor-quality-assessment__slider-shell",
          `iq-investor-quality-assessment__slider-shell--${leaning}`
        ].join(" ")}
      >
        <label className="sr-only" htmlFor={`iq-assessment-slider-${itemLabel}`}>
          {itemLabel} confidence slider
        </label>
        <input
          id={`iq-assessment-slider-${itemLabel}`}
          type="range"
          min={0}
          max={100}
          step={1}
          value={sliderValue}
          className="iq-investor-quality-assessment__slider"
          onChange={(event) => commit(Number(event.target.value))}
        />
      </div>
      <div className="iq-investor-quality-assessment__slider-labels" aria-hidden>
        <span>Weak</span>
        <span>Strong</span>
      </div>
      <p
        className={[
          "iq-investor-quality-assessment__slider-readout",
          leaning === "strong"
            ? "iq-investor-quality-assessment__slider-readout--strong"
            : "iq-investor-quality-assessment__slider-readout--weak"
        ].join(" ")}
      >
        {leaning === "strong" ? "Strong" : "Weak"}
      </p>
    </div>
  );
}

function InvestorStampControl({ itemLabel, value, onSelect }: ControlProps) {
  const { flashValue, select, reduceMotion } = useJudgmentSelect(onSelect);

  return (
    <div
      className="iq-investor-quality-assessment iq-investor-quality-assessment--stamp"
      role="radiogroup"
      aria-label={`${itemLabel} investor verdict stamp`}
    >
      <motion.button
        type="button"
        role="radio"
        aria-checked={value === "yes"}
        className={[
          "iq-investor-quality-assessment__stamp-card",
          "iq-investor-quality-assessment__stamp-card--strong",
          value === "yes" ? "iq-investor-quality-assessment__stamp-card--active" : "",
          flashValue === "yes" ? "iq-investor-quality-assessment__stamp-card--flash" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        whileHover={reduceMotion ? undefined : { y: -6, rotate: -2 }}
        whileTap={reduceMotion ? undefined : { scale: 0.92, rotate: -4 }}
        onClick={() => select("yes")}
      >
        <span className="iq-investor-quality-assessment__stamp-mark" aria-hidden>
          STRONG
        </span>
        <span className="iq-investor-quality-assessment__stamp-label">Investor verdict</span>
      </motion.button>
      <motion.button
        type="button"
        role="radio"
        aria-checked={value === "no"}
        className={[
          "iq-investor-quality-assessment__stamp-card",
          "iq-investor-quality-assessment__stamp-card--weak",
          value === "no" ? "iq-investor-quality-assessment__stamp-card--active" : "",
          flashValue === "no" ? "iq-investor-quality-assessment__stamp-card--flash" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        whileHover={reduceMotion ? undefined : { y: -6, rotate: 2 }}
        whileTap={reduceMotion ? undefined : { scale: 0.92, rotate: 4 }}
        onClick={() => select("no")}
      >
        <span className="iq-investor-quality-assessment__stamp-mark" aria-hidden>
          WEAK
        </span>
        <span className="iq-investor-quality-assessment__stamp-label">Investor verdict</span>
      </motion.button>
    </div>
  );
}

function EvidenceScaleControl({ itemLabel, evidenceCount, value, onSelect }: ControlProps) {
  const { flashValue, select, reduceMotion } = useJudgmentSelect(onSelect);
  const filled = Math.min(5, Math.max(evidenceCount, 1));

  return (
    <div
      className="iq-investor-quality-assessment iq-investor-quality-assessment--evidence-scale iq-investor-quality-assessment--icon-only"
      role="radiogroup"
      aria-label={`${itemLabel} evidence scale`}
    >
      <div className="iq-investor-quality-assessment__evidence-scale-track" aria-hidden>
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={[
              "iq-investor-quality-assessment__evidence-scale-dot",
              index < filled
                ? "iq-investor-quality-assessment__evidence-scale-dot--filled"
                : ""
            ]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </div>
      <div className="iq-investor-quality-assessment__evidence-scale-actions">
        <motion.button
          type="button"
          role="radio"
          aria-label="Strong"
          aria-checked={value === "yes"}
          className={verdictCardClass("strong", value === "yes", flashValue === "yes")}
          whileHover={reduceMotion ? undefined : { y: -6, scale: 1.02 }}
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
          onClick={() => select("yes")}
        >
          <span className="iq-investor-quality-assessment__verdict-thumb" aria-hidden>
            👍
          </span>
        </motion.button>
        <motion.button
          type="button"
          role="radio"
          aria-label="Weak"
          aria-checked={value === "no"}
          className={verdictCardClass("weak", value === "no", flashValue === "no")}
          whileHover={reduceMotion ? undefined : { y: -6, scale: 1.02 }}
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
          onClick={() => select("no")}
        >
          <span className="iq-investor-quality-assessment__verdict-thumb" aria-hidden>
            👎
          </span>
        </motion.button>
      </div>
    </div>
  );
}

type Props = ControlProps & {
  style: InvestorQualityAssessmentStyle;
};

/** Varied assessment widgets — all resolve to yes/no for storage. */
export function InvestorQualityAssessmentControl({
  style,
  itemLabel,
  evidenceCount,
  value,
  onSelect
}: Props) {
  const shared = { itemLabel, evidenceCount, value, onSelect };

  switch (style) {
    case "strength-meter":
    case "verdict":
      return <VerdictControl {...shared} />;
    case "slider":
      return <SliderControl {...shared} />;
    case "investor-stamp":
      return <InvestorStampControl {...shared} />;
    case "evidence-scale":
      return <EvidenceScaleControl {...shared} />;
    default:
      return <VerdictControl {...shared} />;
  }
}
