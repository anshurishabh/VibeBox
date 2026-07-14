"use client";
import SongCard from "./SongCard";

export default function SectionRow({ title, tracks, loading }) {
  if (!loading && (!tracks || tracks.length === 0)) return null;

  return (
    <div className="mb-8">
      <h2 className="font-display text-lg text-paper mb-3">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-36 animate-pulse">
                <div className="aspect-square w-full rounded-lg bg-paper/10" />
                <div className="mt-2 h-3 w-3/4 rounded bg-paper/10" />
                <div className="mt-1.5 h-3 w-1/2 rounded bg-paper/10" />
              </div>
            ))
          : tracks.map((t) => <SongCard key={t.id} track={t} queue={tracks} />)}
      </div>
    </div>
  );
}