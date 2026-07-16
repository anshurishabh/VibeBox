"use client";
import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { toggleFavorite, isFavorite } from "../lib/localLists";
import AddToPlaylistMenu from "./AddToPlaylistMenu";

export default function SongListItem({ track, queue, index, onRemove }) {
  const { playQueue, currentTrack } = usePlayer();
  const [fav, setFav] = useState(() => isFavorite(track.id));
  const [menuOpen, setMenuOpen] = useState(false);
  const isCurrent = currentTrack?.id === track.id;

  function handlePlay() {
    playQueue(queue, index);
  }

  function handleFavoriteClick(e) {
    e.stopPropagation();
    setFav(toggleFavorite(track));
  }

  function handleMenuClick(e) {
    e.stopPropagation();
    setMenuOpen(true);
  }

  function handleRemoveClick(e) {
    e.stopPropagation();
    onRemove?.(track);
  }

  return (
    <>
      <button
        onClick={handlePlay}
        className={`w-full flex items-center gap-4 rounded-xl p-2 text-left transition ${isCurrent ? "bg-paper/10" : "hover:bg-paper/5"}`}
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
        {isCurrent && <span className="text-xs font-mono text-paper/60 flex-shrink-0">playing</span>}
        <span onClick={handleMenuClick} className="flex-shrink-0 text-lg px-1">➕</span>
        <span onClick={handleFavoriteClick} className="flex-shrink-0 text-lg px-1">{fav ? "❤️" : "🤍"}</span>
        {onRemove && (
          <span onClick={handleRemoveClick} className="flex-shrink-0 text-lg px-1 text-moods-stressed">✕</span>
        )}
      </button>
      <AddToPlaylistMenu track={track} open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}