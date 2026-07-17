"use client";
import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { useToast } from "../context/ToastContext";
import { toggleFavorite, isFavorite } from "../lib/localLists";
import { fetchRadioTracks } from "../lib/radio";
import AddToPlaylistMenu from "./AddToPlaylistMenu";

export default function SongListItem({ track, queue, index, onRemove }) {
  const { playQueue, currentTrack } = usePlayer();
  const { showToast } = useToast();
  const [fav, setFav] = useState(() => isFavorite(track.id));
  const [menuOpen, setMenuOpen] = useState(false);
  const isCurrent = currentTrack?.id === track.id;

  function handlePlay() {
    playQueue(queue, index);
  }

  function handleFavoriteClick(e) {
    e.stopPropagation();
    const nowFav = toggleFavorite(track);
    setFav(nowFav);
    showToast(nowFav ? "Added to Favorites" : "Removed from Favorites");
  }

  function handleMenuClick(e) {
    e.stopPropagation();
    setMenuOpen(true);
  }

  function handleRemoveClick(e) {
    e.stopPropagation();
    onRemove?.(track);
    showToast("Removed from playlist");
  }

  async function handleRadioClick(e) {
    e.stopPropagation();
    showToast("Starting radio…");
    const tracks = await fetchRadioTracks(track);
    playQueue(tracks, 0);
  }

  const geniusUrl = "https://genius.com/search?q=" + encodeURIComponent(track.artists + " " + track.name);

  return (
    <>
      <button
        onClick={handlePlay}
        className={"w-full flex items-center gap-4 rounded-xl p-2 text-left transition " + (isCurrent ? "bg-paper/10" : "hover:bg-paper/5")}
      >
        <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-ink/40">
          {track.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={track.image} alt={track.album} className="w-full h-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-body text-sm text-paper truncate">{track.name}</p>
          <p className="font-body text-xs text-paper/50 truncate">{track.artists}</p>
        </div>
        {isCurrent ? <span className="text-xs font-mono text-paper/60 flex-shrink-0">playing</span> : null}
        <a href={geniusUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex-shrink-0 text-lg px-1" title="View lyrics on Genius">📝</a>
        <span onClick={handleRadioClick} className="flex-shrink-0 text-lg px-1" title="Start Radio">📻</span>
        <span onClick={handleMenuClick} className="flex-shrink-0 text-lg px-1">➕</span>
        <span onClick={handleFavoriteClick} className="flex-shrink-0 text-lg px-1">{fav ? "❤️" : "🤍"}</span>
        {onRemove ? (
          <span onClick={handleRemoveClick} className="flex-shrink-0 text-lg px-1 text-moods-stressed">✕</span>
        ) : null}
      </button>
      <AddToPlaylistMenu track={track} open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}