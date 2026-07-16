"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CATEGORIES, LANGUAGES, MOOD_SEARCH_TERMS, MOODS } from "../../lib/moodMapping";
import SongListItem from "../../components/SongListItem";

// Helper function (logic waisa hi hai)
function resolveBrowseTarget(type, id) {
  if (type === "category") {
    const cat = CATEGORIES.find((c) => c.id === id);
    return cat ? { title: cat.label, term: cat.term, country: "US" } : null;
  }
  if (type === "language") {
    const lang = LANGUAGES.find((l) => l.id === id);
    return lang ? { title: lang.label, term: lang.term || lang.label, country: lang.country } : null;
  }
  if (type === "mood") {
    const moodMeta = MOODS.find((m) => m.id === id);
    const term = MOOD_SEARCH_TERMS[id] || MOOD_SEARCH_TERMS.neutral;
    return { title: `${moodMeta?.emoji || ""} ${moodMeta?.label || id}`, term, country: "US" };
  }
  if (type === "trending") return { title: "Trending Songs", term: "trending hit songs 2026", country: "US" };
  if (type === "latest") return { title: "Latest Releases", term: "new released songs 2026", country: "US" };
  return null;
}

// 1. Content component jahan useSearchParams hai
function BrowseContent() {
  const params = useSearchParams();
  const type = params.get("type");
  const id = params.get("id");
  const target = resolveBrowseTarget(type, id);

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    setLoading(true);

    fetch("/api/music/browse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term: target.term, country: target.country, limit: 50 }),
    })
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setTracks(data.tracks || []); })
      .catch(() => { if (!cancelled) setTracks([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [type, id, target]);

  if (!target) {
    return <p className="mt-6 font-body text-paper/60">Section not found.</p>;
  }

  return (
    <>
      <h1 className="font-display text-2xl text-paper mt-4 mb-6">{target.title}</h1>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-14 h-14 rounded-lg bg-paper/10" />
              <div className="flex-1">
                <div className="h-3 w-1/2 rounded bg-paper/10 mb-2" />
                <div className="h-3 w-1/3 rounded bg-paper/10" />
              </div>
            </div>
          ))}
        </div>
      ) : tracks.length === 0 ? (
        <p className="font-body text-paper/50">No songs found for this section.</p>
      ) : (
        <div className="space-y-1">
          {tracks.map((t, i) => <SongListItem key={t.id} track={t} queue={tracks} index={i} />)}
        </div>
      )}
    </>
  );
}

// 2. Main Page with Suspense
export default function BrowsePage() {
  return (
    <main className="min-h-screen px-6 py-8 md:px-12 md:py-10 pb-32">
      <Link href="/" className="text-paper/60 text-sm">← Back</Link>
      <Suspense fallback={<p className="text-paper/60">Loading...</p>}>
        <BrowseContent />
      </Suspense>
    </main>
  );
}