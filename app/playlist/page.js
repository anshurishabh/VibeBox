"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getPlaylist, removeTrackFromPlaylist } from "../../lib/localLists";
import SongListItem from "../../components/SongListItem";

// Aapka saara original logic yahan hai
function PlaylistContent() {
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
    return <p className="mt-6 font-body text-paper/60">Playlist not found.</p>;
  }

  return (
    <>
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
    </>
  );
}

// Ye sirf ek wrapper hai jo next.js ko khush rakhta hai
export default function PlaylistPage() {
  return (
    <main className="min-h-screen px-6 py-8 md:px-12 md:py-10 pb-32">
      <Link href="/" className="text-paper/60 text-sm">← Back</Link>
      <Suspense fallback={<p className="text-paper/60">Loading...</p>}>
        <PlaylistContent />
      </Suspense>
    </main>
  );
}