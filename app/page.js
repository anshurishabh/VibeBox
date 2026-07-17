"use client";
import { useState, useEffect } from "react";
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
import { addRecentSearch, getRecentSearches } from "../lib/localLists";

export default function Page() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);
  const { theme, toggleTheme } = useTheme();

  async function runSearch(q) {
    if (!q.trim()) return;
    setSearching(true);
    try {
      const res = await fetch("/api/music/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      setSearchResults(data.tracks || []);
      addRecentSearch(q);
      setRecentSearches(getRecentSearches());
      setShowSuggestions(false);
    } finally {
      setSearching(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    runSearch(query);
  }

  function handleSuggestionClick(q) {
    setQuery(q);
    runSearch(q);
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
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search any song or artist…"
              className="w-full rounded-full bg-paper/5 border border-paper/20 px-4 py-2 text-sm text-paper placeholder:text-paper/40 focus:outline-none focus:border-paper/60"
            />
            {showSuggestions && recentSearches.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-full bg-ink border border-paper/10 rounded-xl p-2 z-10">
                <p className="text-[10px] font-mono text-paper/40 px-2 mb-1">RECENT SEARCHES</p>
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    onMouseDown={() => handleSuggestionClick(s)}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-paper/5 text-sm text-paper font-body"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
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