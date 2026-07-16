"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getPlaylists, createPlaylist } from "../lib/localLists";

export default function PlaylistsSection() {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    function refresh() { setPlaylists(getPlaylists()); }
    refresh();
    window.addEventListener("playlists:changed", refresh);
    return () => window.removeEventListener("playlists:changed", refresh);
  }, []);

  function handleCreate() {
    const name = window.prompt("Playlist name?");
    if (name && name.trim()) createPlaylist(name);
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg text-paper">Your Playlists</h2>
        <button onClick={handleCreate} className="text-xs font-body text-paper/50 hover:text-paper">
          + New Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <p className="font-body text-sm text-paper/40">No playlists yet — create one above.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {playlists.map((p) => (
            <Link
              key={p.id}
              href={`/playlist?id=${p.id}`}
              className="flex-shrink-0 w-36 rounded-xl p-2 hover:bg-paper/5 transition"
            >
              <div className="aspect-square w-full rounded-lg bg-paper/10 overflow-hidden flex items-center justify-center">
                {p.tracks[0]?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.tracks[0].image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">🎵</span>
                )}
              </div>
              <p className="mt-2 font-body text-sm text-paper truncate">{p.name}</p>
              <p className="font-body text-xs text-paper/50">{p.tracks.length} songs</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}