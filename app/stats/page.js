"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getPlayStats } from "../../lib/localLists";

export default function StatsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setStats(getPlayStats());
  }, []);

  if (!stats) return null;

  const maxArtistCount = stats.topArtists[0]?.[1] || 1;
  const maxGenreCount = stats.topGenres[0]?.[1] || 1;

  return (
    <main className="min-h-screen px-6 py-8 md:px-12 md:py-10 pb-32">
      <Link href="/" className="text-paper/60 text-sm">← Back</Link>
      <h1 className="font-display text-2xl text-paper mt-4 mb-2">Your Stats</h1>
      <p className="font-body text-sm text-paper/50 mb-8">
        Based on {stats.totalPlays} song{stats.totalPlays === 1 ? "" : "s"} played on this device.
      </p>

      {stats.totalPlays === 0 ? (
        <p className="font-body text-paper/40">Play a few songs and come back — your stats will show up here.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-display text-lg text-paper mb-4">Top Artists</h2>
            {stats.topArtists.length === 0 ? (
              <p className="font-body text-sm text-paper/40">Not enough data yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.topArtists.map(([name, count]) => (
                  <div key={name}>
                    <div className="flex justify-between text-sm font-body text-paper mb-1">
                      <span className="truncate">{name}</span>
                      <span className="text-paper/40">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-paper/10 overflow-hidden">
                      <div className="h-full bg-paper rounded-full" style={{ width: `${(count / maxArtistCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-display text-lg text-paper mb-4">Top Genres</h2>
            {stats.topGenres.length === 0 ? (
              <p className="font-body text-sm text-paper/40">Not enough data yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.topGenres.map(([name, count]) => (
                  <div key={name}>
                    <div className="flex justify-between text-sm font-body text-paper mb-1">
                      <span className="truncate">{name}</span>
                      <span className="text-paper/40">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-paper/10 overflow-hidden">
                      <div className="h-full bg-paper rounded-full" style={{ width: `${(count / maxGenreCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}