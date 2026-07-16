"use client";
import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { toggleFavorite, isFavorite } from "../lib/localLists";
import AddToPlaylistMenu from "./AddToPlaylistMenu";

export default function SongCard({ track, queue }) {
  const { playQueue, currentTrack } = usePlayer();
  const [fav, setFav] = useState(() => isFavorite(track.id));
  const [menuOpen, setMenuOpen] = useState(false);
  const isCurrent = currentTrack?.id === track.id;

  function handlePlay() {
    const list = queue || [track];
    const startIndex = list.findIndex((t) => t.id === track.id);
    playQueue(list, startIndex >= 0 ? startIndex : 0);
  }

  function handleFavoriteClick(e) {
    e.stopPropagation();
    setFav(toggleFavorite(track));
  }

  function handleMenuClick(e) {
    e.stopPropagation();
    setMenuOpen(true);
  }

  return (
    <>
      <button
        onClick={handlePlay}
        className={`group flex-shrink-0 w-36 text-left rounded-xl p-2 transition ${
          isCurrent ? "bg-paper/10" : "hover:bg-paper/5"
        }`}
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-ink/40">
          {track.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={track.image} alt={track.album} className="h-full w-full object-cover group-hover:scale-105 transition" />
          )}
          <span onClick={handleFavoriteClick} className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-ink/70 text-xs">
            {fav ? "❤️" : "🤍"}
          </span>
          <span onClick={handleMenuClick} className="absolute top-1.5 left-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-ink/70 text-xs">
            ➕
          </span>
          {isCurrent && (
            <span className="absolute bottom-1.5 left-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-paper text-ink font-mono">
              playing
            </span>
          )}
        </div>
        <p className="mt-2 font-body text-sm text-paper truncate">{track.name}</p>
        <p className="font-body text-xs text-paper/50 truncate">{track.artists}</p>
      </button>
      <AddToPlaylistMenu track={track} open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}