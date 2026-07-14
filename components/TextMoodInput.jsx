"use client";
import { useState } from "react";

export default function TextMoodInput({ onResult }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/mood/analyze-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      onResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's going on right now? e.g. 'long day at work, need to unwind'"
        rows={3}
        className="w-full rounded-xl bg-paper/5 border border-paper/20 px-4 py-3 text-paper placeholder:text-paper/40 font-body focus:outline-none focus:border-paper/60"
      />
      <button
        onClick={analyze}
        disabled={loading || !text.trim()}
        className="self-start px-4 py-2 rounded-full bg-paper text-ink text-sm font-body disabled:opacity-40"
      >
        {loading ? "Reading…" : "Analyze my mood"}
      </button>
    </div>
  );
}
