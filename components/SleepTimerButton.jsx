"use client";
import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";

const OPTIONS = [15, 30, 45, 60];

function formatRemaining(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SleepTimerButton() {
  const { sleepTimerRemaining, setSleepTimer } = usePlayer();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`text-sm ${sleepTimerRemaining ? "opacity-100" : "opacity-40"}`}
        title="Sleep timer"
      >
        {sleepTimerRemaining ? `⏰ ${formatRemaining(sleepTimerRemaining)}` : "⏰"}
      </button>

      {open && (
        <div className="absolute bottom-8 right-0 bg-ink border border-paper/10 rounded-xl p-2 shadow-lg z-10 w-32">
          {OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => { setSleepTimer(m); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-paper/10 text-sm text-paper font-body"
            >
              {m} min
            </button>
          ))}
          {sleepTimerRemaining && (
            <button
              onClick={() => { setSleepTimer(0); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-paper/10 text-sm text-moods-stressed font-body"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}