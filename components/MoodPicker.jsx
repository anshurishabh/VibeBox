"use client";
import { MOODS } from "../lib/moodMapping";

export default function MoodPicker({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.filter((m) => m.id !== "neutral").map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className={`px-4 py-2 rounded-full border font-body text-sm transition
            ${
              selected === m.id
                ? "bg-paper text-ink border-paper"
                : "border-paper/25 text-paper/80 hover:border-paper/60"
            }`}
        >
          <span className="mr-1">{m.emoji}</span>
          {m.label}
        </button>
      ))}
    </div>
  );
}
