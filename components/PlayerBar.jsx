"use client";
import { usePlayer } from "../context/PlayerContext";

export default function PlayerBar() {
  const { currentTrack, isPlaying, status, errorMessage, togglePlay, next, prev } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-ink/95 backdrop-blur border-t border-paper/10 px-4 py-3 flex items-center gap-3">
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-paper/10 flex-shrink-0">
        {currentTrack.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentTrack.image} alt={currentTrack.album} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-body text-sm text-paper truncate">{currentTrack.name}</p>
        <p className="font-body text-xs text-paper/50 truncate">
          {status === "loading" ? "Loading…" : currentTrack.artists}
        </p>
        {status === "error" && errorMessage && (
          <p className="font-body text-xs text-moods-stressed truncate">{errorMessage}</p>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <button onClick={prev} className="text-paper/70 text-lg">⏮</button>
        <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-paper text-ink flex items-center justify-center text-sm">
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button onClick={next} className="text-paper/70 text-lg">⏭</button>
      </div>
    </div>
  );
}