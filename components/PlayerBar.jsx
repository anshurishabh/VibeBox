"use client";
import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import QueueView from "./QueueView";

function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlayerBar() {
  const {
    currentTrack, isPlaying, status, errorMessage, currentTime, duration,
    shuffle, repeatMode, volume,
    togglePlay, seekTo, next, prev, toggleShuffle, cycleRepeat, setVolume,
  } = usePlayer();
  const [queueOpen, setQueueOpen] = useState(false);

  if (!currentTrack) return null;

  const repeatOpacity = repeatMode === "off" ? "opacity-40" : "opacity-100";

  return (
    <>
      <QueueView open={queueOpen} onClose={() => setQueueOpen(false)} />
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-ink/95 backdrop-blur border-t border-paper/10 px-4 pt-2 pb-3">
        {/* Real slider - supports click AND drag to seek within the song */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-[10px] text-paper/40 w-9 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(e) => seekTo(Number(e.target.value))}
            disabled={!duration}
            className="flex-1 accent-paper h-1.5"
          />
          <span className="font-mono text-[10px] text-paper/40 w-9">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center gap-3">
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

          <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 accent-paper"
              title="Volume"
            />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={toggleShuffle} className={`text-sm ${shuffle ? "opacity-100" : "opacity-40"}`} title="Shuffle">
              🔀
            </button>
            <button onClick={() => seekTo(Math.max(0, currentTime - 10))} className="text-paper/70 text-xs" title="Back 10s">
              «10
            </button>
            <button onClick={prev} className="text-paper/70 text-lg">⏮</button>
            <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-paper text-ink flex items-center justify-center text-sm">
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button onClick={next} className="text-paper/70 text-lg">⏭</button>
            <button onClick={() => seekTo(Math.min(duration, currentTime + 10))} className="text-paper/70 text-xs" title="Forward 10s">
              10»
            </button>
            <button onClick={cycleRepeat} className={`text-sm ${repeatOpacity}`} title={`Repeat: ${repeatMode}`}>
              🔁
            </button>
            <button onClick={() => setQueueOpen(true)} className="text-paper/70 text-sm" title="Queue">
              ☰
            </button>
          </div>
        </div>
      </div>
    </>
  );
}