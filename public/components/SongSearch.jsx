"use client";
import { useState } from "react";

export default function SongSearch({ onResults }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function search() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/music/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      onResults(data.tracks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") search();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search any song or artist…"
          className="flex-1 rounded-full bg-paper/5 border border-paper/20 px-4 py-2.5 text-paper placeholder:text-paper/40 font-body focus:outline-none focus:border-paper/60"
        />
        <button
          onClick={search}
          disabled={loading || !query.trim()}
          className="px-5 py-2.5 rounded-full bg-paper text-ink text-sm font-body disabled:opacity-40"
        >
          {loading ? "…" : "Search"}
        </button>
      </div>
      {error && <p className="text-sm text-moods-stressed font-body">{error}</p>}
    </div>
  );
}
