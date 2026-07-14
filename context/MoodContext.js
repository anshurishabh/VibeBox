"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { resolveFinalMood } from "../lib/moodMapping";

const MoodContext = createContext(null);

export function MoodProvider({ children }) {
  const [manual, setManual] = useState(null);
  const [textSignal, setTextSignal] = useState(null);
  const [faceSignal, setFaceSignal] = useState(null);

  const resolved = useMemo(
    () => resolveFinalMood({ manual, text: textSignal, face: faceSignal }),
    [manual, textSignal, faceSignal]
  );

  return (
    <MoodContext.Provider
      value={{ mood: resolved.mood, confidence: resolved.confidence, setManual, setTextSignal, setFaceSignal }}
    >
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  const ctx = useContext(MoodContext);
  if (!ctx) throw new Error("useMood must be used within a MoodProvider");
  return ctx;
}