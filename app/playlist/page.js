"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getPlaylist, removeTrackFromPlaylist } from "../../lib/localLists";
import SongListItem from "../../components/SongListItem";

export default function PlaylistPage() {
  const params = useSearchParams();
  const id = params.get("id");
  const [playlist, setPlaylist] = useState(null);

  useEffect(() => {
    function refresh() { setPlaylist(getPlaylist(id)); }
    refresh();
    window.addEventListener("playlists:changed", refresh);
    return () => window.removeEventListener("playlists:changed", refresh);
  }, [id]);

  function handleRemove(track) {
    removeTrackFromPlaylist(id, track.id);
  }

  if (!playlist) {
    return (
      <main className="min-h-screen px-6 py-10 pb-32">
        <Link href="/" className="text-paper/60 text-sm">← Back</Link>
        <p className="mt-6 font-body text-paper/60">Playlist not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-8 md:px-12 md:py-10 pb-32">
      <Link href="/" className="text-paper/60 text-sm">← Back</Link>
      <h1 className="font-display text-2xl text-paper mt-4 mb-6">{playlist.name}</h1>

      {playlist.tracks.length === 0 ? (
        <p className="font-body text-paper/50">No songs in this playlist yet.</p>
      ) : (
        <div className="space-y-1">
          {playlist.tracks.map((t, i) => (
            <SongListItem key={t.id} track={t} queue={playlist.tracks} index={i} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </main>
  );
}