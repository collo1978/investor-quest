"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

type SpeechRecognitionResultList = {
  length: number;
  [index: number]: {
    isFinal: boolean;
    0?: { transcript: string };
  };
};

type SpeechRecognitionResultEvent = {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const win = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

export function useInvestorChallengeSpeech() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    setSupported(getSpeechRecognitionCtor() != null);
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
    setInterim("");
  }, []);

  const startListening = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError("Voice input is not supported in this browser.");
      return false;
    }

    setError(null);
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (!result?.[0]) continue;
        const text = result[0].transcript;
        if (result.isFinal) finalChunk += text;
        else interimChunk += text;
      }
      if (finalChunk.trim()) {
        setTranscript((prev) => `${prev} ${finalChunk}`.trim());
      }
      setInterim(interimChunk.trim());
    };

    recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        setError("Could not capture your voice. Try typing instead.");
      }
      setListening(false);
      setInterim("");
    };

    recognition.onend = () => {
      setListening(false);
      setInterim("");
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
      return true;
    } catch {
      setError("Microphone is busy. Try again.");
      return false;
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
      return;
    }
    startListening();
  }, [listening, startListening, stopListening]);

  const reset = useCallback(() => {
    recognitionRef.current?.abort();
    setListening(false);
    setTranscript("");
    setInterim("");
    setError(null);
  }, []);

  const displayText = [transcript, interim].filter(Boolean).join(" ").trim();

  return {
    supported,
    listening,
    transcript,
    interim,
    displayText,
    error,
    toggleListening,
    stopListening,
    reset,
    setTranscript
  };
}
