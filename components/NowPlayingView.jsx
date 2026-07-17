"use client";
import { usePlayer } from "../context/PlayerContext";
import SleepTimerButton from "./SleepTimerButton";

function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + ":" + s.toString().padStart(2, "0");
}

export default function NowPlayingView({ open, onClose }) {
  const {
    currentTrack, isPlaying, currentTime, duration,
    shuffle, repeatMode, volume,
    togglePlay, seekTo, next, prev, toggleShuffle, cycleRepeat, setVolume,
  } = usePlayer();

  if (!open || !currentTrack) return null;

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const repeatOpacity = repeatMode === "off" ? "opacity-40" : "opacity-100";
  const geniusUrl = "https://genius.com/search?q=" + encodeURIComponent(currentTrack.artists + " " + currentTrack.name);

  return (
    <div className="fixed inset-0 z-[60] bg-ink flex flex-col items-center justify-center px-6 py-10">
      <button onClick={onClose} className="absolute top-6 left-6 text-paper/60 text-2xl leading-none">↓</button>

      <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl overflow-hidden bg-paper/10 shadow-2xl mb-8">
        {currentTrack.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentTrack.image} alt={currentTrack.album} className="w-full h-full object-cover" />
        )}
      </div>

      <h1 className="font-display text-2xl text-paper text-center mb-1">{currentTrack.name}</h1>
      <p className="font-body text-paper/50 text-center mb-8">{currentTrack.artists}</p>

      <div className="w-full max-w-md">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onChange={(e) => seekTo(Number(e.target.value))}
          disabled={!duration}
          className="w-full accent-paper mb-1"
        />
        <div className="flex justify-between font-mono text-xs text-paper/40 mb-6">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-center gap-6 mb-8">
          <button onClick={toggleShuffle} className={"text-lg " + (shuffle ? "opacity-100" : "opacity-40")}>🔀</button>
          <button onClick={prev} className="text-paper text-2xl">⏮</button>
          <button onClick={togglePlay} className="w-14 h-14 rounded-full bg-paper text-ink flex items-center justify-center text-xl">
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button onClick={next} className="text-paper text-2xl">⏭</button>
          <button onClick={cycleRepeat} className={"text-lg " + repeatOpacity}>🔁</button>
        </div>

        <div className="flex items-center justify-center gap-4">
          <span className="text-paper/50 text-sm">🔉</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-32 accent-paper"
          />
          <a href={geniusUrl} target="_blank" rel="noreferrer" className="text-paper/70 text-lg">📝</a>
          <SleepTimerButton />
        </div>
      </div>
    </div>
  );
}