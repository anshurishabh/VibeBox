"use client";
import { useEffect, useState } from "react";
import SectionRow from "./SectionRow";
import { useMood } from "../context/MoodContext";
import { useLanguage } from "../context/LanguageContext";
import { MOODS } from "../lib/moodMapping";

export default function MoodSection() {
  const { mood } = useMood();
  const { language } = useLanguage();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch("/api/music/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood, language }),
    })
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setTracks(data.tracks || []); })
      .catch(() => { if (!cancelled) setTracks([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [mood, language]);

  const moodMeta = MOODS.find((m) => m.id === mood);
  const title = "Recommended for Your Mood " + (moodMeta ? moodMeta.emoji + " " + moodMeta.label : "");

  return <SectionRow title={title} tracks={tracks} loading={loading} seeMoreHref={`/browse?type=mood&id=${mood}`} />;
}