"use client";
import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";
import MoodSection from "../components/MoodSection";
import AutoSection from "../components/AutoSection";
import RecentlyPlayedSection from "../components/RecentlyPlayedSection";
import FavoritesSection from "../components/FavoritesSection";
import PlaylistsSection from "../components/PlaylistsSection";
import HistoryBasedSection from "../components/HistoryBasedSection";
import SectionRow from "../components/SectionRow";
import MoodQuickPicker from "../components/MoodQuickPicker";
import { CATEGORIES, LANGUAGES } from "../lib/moodMapping";
import ImportExportButtons from "../components/ImportExportButtons";

export default function Page() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const { theme, toggleTheme } = useTheme();

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch("/api/music/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setSearchResults(data.tracks || []);
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setQuery("");
    setSearchResults(null);
  }

  const realLanguages = LANGUAGES.filter((l) => l.id !== "any");

  return (
    <main className="min-h-screen px-6 py-8 md:px-12 md:py-10 pb-32">
      <header className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <p className="font-display text-2xl text-paper">VibeBox</p>
          <Link href="/stats" className="text-xs font-body text-paper/50 hover:text-paper">Your Stats</Link>
          <ImportExportButtons />
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any song or artist…"
            className="flex-1 rounded-full bg-paper/5 border border-paper/20 px-4 py-2 text-sm text-paper placeholder:text-paper/40 focus:outline-none focus:border-paper/60"
          />
          <button type="submit" className="px-4 py-2 rounded-full bg-paper text-ink text-sm font-body">
            {searching ? "…" : "Search"}
          </button>
          {searchResults && (
            <button type="button" onClick={clearSearch} className="px-3 py-2 rounded-full border border-paper/20 text-paper/70 text-sm">
              Clear
            </button>
          )}
        </form>
        <button
          onClick={toggleTheme}
          className="px-3 py-2 rounded-full border border-paper/20 text-paper/70 text-sm"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </header>

      {searchResults ? (
        <SectionRow title={`Search results for "${query}"`} tracks={searchResults} loading={searching} />
      ) : (
        <>
          <MoodSection />
          <AutoSection title="Trending Songs" term="trending hit songs 2026" country="US" type="trending" id="trending" />
          <AutoSection title="Latest Releases" term="new released songs 2026" country="US" type="latest" id="latest" />
          <HistoryBasedSection />
          <RecentlyPlayedSection />
          <FavoritesSection />
          <PlaylistsSection />

          <h2 className="font-display text-xl text-paper mt-10 mb-4">Language-wise Music</h2>
          {realLanguages.map((l) => (
            <AutoSection key={l.id} title={l.label} term={l.term} country={l.country} type="language" id={l.id} />
          ))}

          <h2 className="font-display text-xl text-paper mt-10 mb-4">Category-wise Music</h2>
          {CATEGORIES.map((c) => (
            <AutoSection key={c.id} title={c.label} term={c.term} country="US" type="category" id={c.id} />
          ))}
        </>
      )}

      <MoodQuickPicker />
    </main>
  );
}