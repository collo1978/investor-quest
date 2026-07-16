"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import type { PillarQuestTheme } from "@/components/quest/pillarQuestTheme";
import { useInvestorChallengeSpeech } from "@/hooks/useInvestorChallengeSpeech";
import {
  buildInvestorChallengeFeedback,
  evaluateInvestorChallengeResponse,
  type InvestorChallengeEvaluation
} from "@/lib/business/evaluateInvestorChallenge";
import type { InvestorChallengeDef } from "@/lib/business/businessInvestorChallengeFlow";

type Props = {
  challenge: InvestorChallengeDef;
  theme: PillarQuestTheme;
  submitting?: boolean;
  onSubmit: (response: string, evaluation: InvestorChallengeEvaluation) => void;
};

export function BusinessInvestorChallengeCard({
  challenge,
  submitting = false,
  onSubmit
}: Props) {
  const reduceMotion = useReducedMotion();
  const speech = useInvestorChallengeSpeech();
  const [response, setResponse] = useState("");
  const [inputMode, setInputMode] = useState<"voice" | "type">("voice");
  const [lastEvaluation, setLastEvaluation] = useState<InvestorChallengeEvaluation | null>(
    null
  );

  const passed =
    lastEvaluation?.outcome === "great" || lastEvaluation?.outcome === "good";
  const feedback =
    lastEvaluation != null ? buildInvestorChallengeFeedback(lastEvaluation) : null;
  const hasResponse = response.trim().length > 0;
  const liveVoiceText = speech.displayText;

  useEffect(() => {
    if (inputMode !== "voice" || !speech.listening) return;
    if (liveVoiceText) {
      setResponse(liveVoiceText);
      if (lastEvaluation) setLastEvaluation(null);
    }
  }, [inputMode, speech.listening, liveVoiceText, lastEvaluation]);

  const handleMicClick = useCallback(() => {
    if (passed || submitting) return;
    if (!speech.supported) {
      setInputMode("type");
      speech.reset();
      return;
    }
    setInputMode("voice");
    speech.toggleListening();
  }, [passed, submitting, speech]);

  const handleTypeInstead = useCallback(() => {
    speech.stopListening();
    setInputMode("type");
  }, [speech]);

  const handleBackToVoice = useCallback(() => {
    setInputMode("voice");
  }, []);

  const handleSubmit = useCallback(() => {
    speech.stopListening();
    const evaluation = evaluateInvestorChallengeResponse(response, challenge);
    setLastEvaluation(evaluation);
    if (evaluation.outcome === "retry") return;
    // Persist + celebrate immediately — no secondary evidence replay screen.
    onSubmit(response, evaluation);
  }, [challenge, onSubmit, response, speech]);

  const handleRetry = useCallback(() => {
    setLastEvaluation(null);
    setResponse("");
    speech.reset();
    setInputMode("voice");
  }, [speech]);

  return (
    <motion.div
      className="iq-investor-challenge mx-auto w-full max-w-2xl"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <header className="iq-investor-challenge__header">
        <h2 className="iq-investor-challenge__title">🎤 Investor Challenge</h2>
        <p className="iq-investor-challenge__subtitle">
          A great investor can explain a business simply.
        </p>
        <p className="iq-investor-challenge__prompt">{challenge.prompt}</p>
      </header>

      <div className="iq-investor-challenge__stage">
        <AnimatePresence mode="wait" initial={false}>
          {inputMode === "voice" ? (
            <motion.div
              key="voice"
              className="iq-investor-challenge__voice-stage"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22 }}
            >
              <div className="iq-investor-challenge__mic-wrap">
                <span
                  className={[
                    "iq-investor-challenge__mic-ring",
                    speech.listening ? "iq-investor-challenge__mic-ring--live" : ""
                  ].join(" ")}
                  aria-hidden
                />
                <span
                  className={[
                    "iq-investor-challenge__mic-ring iq-investor-challenge__mic-ring--inner",
                    speech.listening ? "iq-investor-challenge__mic-ring--live" : ""
                  ].join(" ")}
                  aria-hidden
                />
                <button
                  type="button"
                  className={[
                    "iq-investor-challenge__mic-btn",
                    speech.listening ? "iq-investor-challenge__mic-btn--live" : ""
                  ].join(" ")}
                  disabled={submitting || passed}
                  aria-pressed={speech.listening}
                  aria-label={
                    speech.listening
                      ? "Stop recording your answer"
                      : "Speak your answer"
                  }
                  onClick={handleMicClick}
                >
                  <span className="iq-investor-challenge__mic-icon" aria-hidden>
                    🎤
                  </span>
                </button>
              </div>

              <p className="iq-investor-challenge__mic-label">
                {speech.listening ? "Listening… tap to finish" : "Speak Your Answer"}
              </p>

              {speech.error ? (
                <p className="iq-investor-challenge__speech-hint" role="status">
                  {speech.error}
                </p>
              ) : null}

              {hasResponse && !speech.listening ? (
                <div className="iq-investor-challenge__transcript">
                  <p className="iq-investor-challenge__transcript-body">{response}</p>
                  <button
                    type="button"
                    className="iq-investor-challenge__transcript-reset"
                    onClick={handleRetry}
                    disabled={passed}
                  >
                    Re-record
                  </button>
                </div>
              ) : speech.listening && liveVoiceText ? (
                <div className="iq-investor-challenge__transcript iq-investor-challenge__transcript--live">
                  <p className="iq-investor-challenge__transcript-body">{liveVoiceText}</p>
                </div>
              ) : null}

              <div className="iq-investor-challenge__or">
                <span className="iq-investor-challenge__or-line" aria-hidden />
                <span className="iq-investor-challenge__or-text">or</span>
                <span className="iq-investor-challenge__or-line" aria-hidden />
              </div>

              <button
                type="button"
                className="iq-investor-challenge__type-toggle"
                onClick={handleTypeInstead}
                disabled={passed}
              >
                <span aria-hidden>⌨</span> Type Your Answer
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="type"
              className="iq-investor-challenge__type-stage"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <textarea
                id="investor-challenge-response"
                className="iq-investor-challenge__type-input"
                rows={5}
                value={response}
                disabled={submitting || passed}
                placeholder="Explain it like you're briefing a friend…"
                aria-label="Type your answer"
                onChange={(event) => {
                  setResponse(event.target.value);
                  if (lastEvaluation) setLastEvaluation(null);
                }}
              />
              <button
                type="button"
                className="iq-investor-challenge__type-toggle iq-investor-challenge__type-toggle--back"
                onClick={handleBackToVoice}
                disabled={passed}
              >
                <span aria-hidden>🎤</span> Speak Your Answer
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {feedback && lastEvaluation?.outcome === "retry" ? (
          <motion.div
            className="iq-investor-challenge__feedback iq-investor-challenge__feedback--retry"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            role="status"
          >
            {feedback}
          </motion.div>
        ) : null}

        <div className="iq-investor-challenge__actions">
          {lastEvaluation?.outcome === "retry" ? (
            <button
              type="button"
              className="iq-investor-challenge__cta iq-investor-challenge__cta--ghost"
              onClick={handleRetry}
            >
              Start over
            </button>
          ) : null}
          <button
            type="button"
            className="iq-investor-challenge__cta"
            disabled={submitting || !hasResponse || passed}
            onClick={handleSubmit}
          >
            {lastEvaluation?.outcome === "retry"
              ? "Try again"
              : "Submit your explanation"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
