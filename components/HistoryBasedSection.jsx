"use client";
import { useEffect, useState } from "react";
import SectionRow from "./SectionRow";
import { getRecentlyPlayed } from "../lib/localLists";

function topFrom(list, key) {
  const counts = {};
  list.forEach((t) => {
    const val = t[key];
    if (val) counts[val] = (counts[val] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : null;
}

export default function HistoryBasedSection() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState(null);

  useEffect(() => {
    const history = getRecentlyPlayed();
    if (history.length === 0) {
      setLoading(false);
      return;
    }

    const topGenre = topFrom(history, "genre");
    const topArtist = topFrom(history, "artists");
    const basis = topGenre || topArtist;
    if (!basis) {
      setLoading(false);
      return;
    }
    setLabel(basis);

    let cancelled = false;
    fetch("/api/music/browse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term: `${basis} songs`, country: "US", limit: 12 }),
    })
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setTracks(data.tracks || []); })
      .catch(() => { if (!cancelled) setTracks([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  if (!loading && (!label || tracks.length === 0)) return null;

  return <SectionRow title={`Because you listened to ${label || "…"}`} tracks={tracks} loading={loading} />;
}