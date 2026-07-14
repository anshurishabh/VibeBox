"use client";
import { useEffect, useState } from "react";
import SectionRow from "./SectionRow";

export default function AutoSection({ title, term, country = "US", limit = 12 }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch("/api/music/browse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term, country, limit }),
    })
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setTracks(data.tracks || []); })
      .catch(() => { if (!cancelled) setTracks([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [term, country, limit]);

  return <SectionRow title={title} tracks={tracks} loading={loading} />;
}