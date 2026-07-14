"use client";
import { useCallback, useMemo, useState } from "react";
import MoodOrb from "../components/MoodOrb";
import MoodPicker from "../components/MoodPicker";
import TextMoodInput from "../components/TextMoodInput";
import FaceMoodDetector from "../components/FaceMoodDetector";
import LanguagePicker from "../components/LanguagePicker";
import SongSearch from "../components/SongSearch";
import RecommendationList from "../components/RecommendationList";
import { resolveFinalMood } from "../lib/moodMapping";

const TABS = [
  { id: "pick", label: "Pick" },
  { id: "tell", label: "Tell" },
  { id: "show", label: "Show" },
  { id: "search", label: "Search" },
];

export default function Page() {
  const [activeTab, setActiveTab] = useState("pick");
  const [manual, setManual] = useState(null);
  const [textSignal, setTextSignal] = useState(null);
  const [faceSignal, setFaceSignal] = useState(null);
  const [language, setLanguage] = useState("any");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [resultsLabel, setResultsLabel] = useState("for this moment");

  const isSearchTab = activeTab === "search";

  const resolved = useMemo(
    () => resolveFinalMood({ manual, text: textSignal, face: faceSignal }),
    [manual, textSignal, faceSignal]
  );

  const handleFaceResult = useCallback((result) => setFaceSignal(result), []);

  async function findMusic() {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/music/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: resolved.mood, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setTracks(data.tracks || []);
      setResultsLabel("for this moment");
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchResults(results) {
    setTracks(results);
    setResultsLabel("search results");
    setFetchError(results.length === 0 ? "No tracks found — try a different spelling." : null);
  }

  return (
    <main className="min-h-screen px-6 py-14 md:px-16 md:py-20">
      <header className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-paper/50 mb-3">
          undertone
        </p>
        <h1 className="font-display text-4xl md:text-5xl leading-tight max-w-xl">
          Tell it how you feel. It finds the sound underneath.
        </h1>
      </header>

      <section className="grid md:grid-cols-2 gap-12 items-start">
        <div className="flex flex-col items-center md:items-start gap-8">
          <MoodOrb mood={resolved.mood} />

          <div className="w-full max-w-md">
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <div className="flex gap-1 rounded-full bg-paper/5 p-1 w-fit">
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
              {!isSearchTab && <LanguagePicker selected={language} onChange={setLanguage} />}
            </div>

            {activeTab === "pick" && <MoodPicker selected={manual} onSelect={setManual} />}
            {activeTab === "tell" && <TextMoodInput onResult={setTextSignal} />}
            {activeTab === "show" && <FaceMoodDetector onResult={handleFaceResult} />}
            {activeTab === "search" && <SongSearch onResults={handleSearchResults} />}

            {!isSearchTab && (
              <button
                onClick={findMusic}
                disabled={loading}
                className="mt-8 w-full md:w-auto px-6 py-3 rounded-full bg-paper text-ink font-body text-sm disabled:opacity-40"
              >
                {loading ? "Listening…" : "Find my music"}
              </button>
            )}

            {fetchError && (
              <p className="mt-3 text-sm text-moods-stressed font-body">{fetchError}</p>
            )}
          </div>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-paper/40 mb-4">
            {resultsLabel}
          </p>
          <RecommendationList tracks={tracks} loading={loading} />
          {!loading && tracks.length === 0 && !fetchError && (
            <p className="font-body text-paper/40 text-sm">
              {isSearchTab
                ? "Search for any song or artist by name."
                : "Choose, type, or show your mood, then find your music."}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

