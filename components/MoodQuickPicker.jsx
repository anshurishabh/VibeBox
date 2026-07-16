"use client";
import { useState } from "react";
import { useMood } from "../context/MoodContext";
import { useLanguage } from "../context/LanguageContext";
import MoodPicker from "./MoodPicker";
import TextMoodInput from "./TextMoodInput";
import FaceMoodDetector from "./FaceMoodDetector";
import { MOODS, LANGUAGES } from "../lib/moodMapping";

const TABS = [
  { id: "pick", label: "Pick" },
  { id: "tell", label: "Tell" },
  { id: "show", label: "Show" },
];

export default function MoodQuickPicker() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("mood"); // "mood" | "language"
  const [activeTab, setActiveTab] = useState("pick");
  const { mood, setManual, setTextSignal, setFaceSignal } = useMood();
  const { language, setLanguageManual, setLanguageFromText } = useLanguage();
  const moodMeta = MOODS.find((m) => m.id === mood);

  function closeAndReset() {
    setOpen(false);
    setStep("mood");
    setActiveTab("pick");
  }

  function handleMoodPicked(m) {
    setManual(m);
    setStep("language");
  }

  function handleTextResult(r, rawText) {
    setTextSignal(r);
    setLanguageFromText(rawText);
    setStep("language");
  }

  function handleLanguageChosen(id) {
    setLanguageManual(id);
    closeAndReset();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full bg-paper text-ink text-2xl shadow-lg flex items-center justify-center"
      >
        {moodMeta?.emoji || "🙂"}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-ink/70" onClick={closeAndReset}>
          <div
            className="w-full sm:w-96 max-h-[80vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-ink border border-paper/10 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            {step === "mood" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg text-paper">How are you feeling?</h3>
                  <button onClick={closeAndReset} className="text-paper/50 text-xl leading-none">×</button>
                </div>

                <div className="flex gap-1 mb-4 rounded-full bg-paper/5 p-1 w-fit">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`px-4 py-1.5 rounded-full text-sm font-body transition ${
                        activeTab === t.id ? "bg-paper text-ink" : "text-paper/60"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {activeTab === "pick" && <MoodPicker selected={null} onSelect={handleMoodPicked} />}
                {activeTab === "tell" && (
                  <TextMoodInput
                    onResult={(r) => handleTextResult(r)}
                    onLanguageDetected={(text) => setLanguageFromText(text)}
                  />
                )}
                {activeTab === "show" && (
                  <div className="flex flex-col gap-3">
                    <FaceMoodDetector onResult={(r) => setFaceSignal(r)} />
                    <button
                      onClick={() => setStep("language")}
                      className="px-4 py-2 rounded-full bg-paper text-ink text-sm font-body self-start"
                    >
                      Continue
                    </button>
                  </div>
                )}
              </>
            )}

            {step === "language" && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg text-paper">Which language songs?</h3>
                  <button onClick={closeAndReset} className="text-paper/50 text-xl leading-none">×</button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => handleLanguageChosen(l.id)}
                      className={`px-4 py-2 rounded-full border font-body text-sm transition ${
                        language === l.id
                          ? "bg-paper text-ink border-paper"
                          : "border-paper/25 text-paper/80 hover:border-paper/60"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}