"use client";
import TrackCard from "./TrackCard";

export default function RecommendationList({ tracks, loading }) {
  if (loading) {
    return <p className="font-body text-paper/50 text-sm">Finding tracks for this moment…</p>;
  }
  if (!tracks || tracks.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {tracks.map((t) => (
        <TrackCard key={t.id} track={t} />
      ))}
    </div>
  );
}
