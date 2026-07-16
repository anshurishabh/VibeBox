"use client";
import Link from "next/link";
import SongCard from "./SongCard";

export default function SectionRow({ title, tracks, loading, seeMoreHref }) {
  if (!loading && (!tracks || tracks.length === 0)) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg text-paper">{title}</h2>
        {seeMoreHref && !loading && tracks.length > 0 && (
          <Link href={seeMoreHref} className="text-xs font-body text-paper/50 hover:text-paper">
            See More →
          </Link>
        )}
      </div>
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