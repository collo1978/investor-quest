"use client";

import Image from "next/image";
import { useState } from "react";

const NVIDIA_LOGO = "/logos/companies/nvda.svg";

function CardCorner({ position }: { position: "top" | "bottom" }) {
  return (
    <span
      className={`iq-value-card__corner iq-value-card__corner--${position}`}
      aria-hidden="true"
    >
      <Image src={NVIDIA_LOGO} alt="" width={58} height={32} priority />
    </span>
  );
}

/** The focused two-stage learning experience for NVIDIA's value proposition. */
export function NvidiaValuePropositionMission() {
  const [started, setStarted] = useState(false);
  const [flipped, setFlipped] = useState(false);

  if (!started) {
    return (
      <section className="iq-value-mission iq-value-mission--intro" aria-labelledby="value-mission-title">
        <div className="iq-value-mission__intro-content">
          <p className="iq-value-mission__eyebrow">Your mission</p>
          <h2 id="value-mission-title">Build NVIDIA&apos;s Value Proposition</h2>
          <div className="iq-value-mission__brief">
            <p>Investigate real customer problems.</p>
            <p>Uncover how NVIDIA solves them.</p>
            <p>Piece together NVIDIA&apos;s value proposition.</p>
          </div>
          <button
            type="button"
            className="iq-value-mission__start"
            onClick={() => setStarted(true)}
          >
            Start mission <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="iq-value-mission iq-value-mission--cards" aria-label="NVIDIA value proposition problem card">
      <button
        type="button"
        className={`iq-value-card${flipped ? " iq-value-card--flipped" : ""}`}
        onClick={() => setFlipped((current) => !current)}
        aria-pressed={flipped}
        aria-label={flipped ? "Show the customer problem" : "Reveal NVIDIA's answer"}
      >
        <span className="iq-value-card__inner">
          <span className="iq-value-card__face iq-value-card__face--front">
            <CardCorner position="top" />
            <span className="iq-value-card__front-content">
              <span className="iq-value-card__quote">
                “I asked an AI to generate a video and it took forever.”
              </span>
              <span className="iq-value-card__question">How can NVIDIA help?</span>
            </span>
            <span className="iq-value-card__flip-cue">
              <span aria-hidden="true">↻</span> Tap to flip
            </span>
            <CardCorner position="bottom" />
          </span>

          <span className="iq-value-card__face iq-value-card__face--back">
            <CardCorner position="top" />
            <span className="iq-value-card__answer-content">
              <span className="iq-value-card__answer-label">NVIDIA&apos;s answer</span>
              <span className="iq-value-card__answer-title">Accelerated Computing</span>
              <span className="iq-value-card__answer-copy">
                NVIDIA GPUs can process huge numbers of calculations at the same time,
                helping demanding AI tasks run much faster.
              </span>
              <span className="iq-value-card__divider" aria-hidden="true" />
              <span className="iq-value-card__value-label">The value</span>
              <span className="iq-value-card__value-title">Get results faster.</span>
            </span>
            <CardCorner position="bottom" />
          </span>
        </span>
      </button>
    </section>
  );
}
