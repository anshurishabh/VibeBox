"use client";
import { useState } from "react";
import { useMood } from "../context/MoodContext";
import MoodPicker from "./MoodPicker";
import TextMoodInput from "./TextMoodInput";
import FaceMoodDetector from "./FaceMoodDetector";
import { MOODS } from "../lib/moodMapping";

const TABS = [
  { id: "pick", label: "Pick" },
  { id: "tell", label: "Tell" },
  { id: "show", label: "Show" },
];

export default function MoodQuickPicker() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pick");
  const { mood, setManual, setTextSignal, setFaceSignal } = useMood();
  const moodMeta = MOODS.find((m) => m.id === mood);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full bg-paper text-ink text-2xl shadow-lg flex items-center justify-center"
      >
        {moodMeta?.emoji || "🙂"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-ink/70"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full sm:w-96 max-h-[80vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-ink border border-paper/10 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-paper">How are you feeling?</h3>
              <button onClick={() => setOpen(false)} className="text-paper/50 text-xl leading-none">×</button>
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

            {activeTab === "pick" && (
              <MoodPicker selected={null} onSelect={(m) => { setManual(m); setOpen(false); }} />
            )}
            {activeTab === "tell" && (
              <TextMoodInput onResult={(r) => { setTextSignal(r); setOpen(false); }} />
            )}
            {activeTab === "show" && <FaceMoodDetector onResult={(r) => setFaceSignal(r)} />}
          </div>
        </div>
      )}
    </>
  );
}