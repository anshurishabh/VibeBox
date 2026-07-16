"use client";
import { usePlayer } from "../context/PlayerContext";

export default function QueueView({ open, onClose }) {
  const { upcoming, currentTrack, orderPos, playAtOrderPos } = usePlayer();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-ink/70" onClick={onClose}>
      <div
        className="w-full sm:w-96 max-h-[70vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-ink border border-paper/10 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-paper">Up Next</h3>
          <button onClick={onClose} className="text-paper/50 text-xl leading-none">×</button>
        </div>

        {currentTrack && (
          <div className="mb-4">
            <p className="text-xs font-mono text-paper/40 mb-1">NOW PLAYING</p>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-paper/10">
              {currentTrack.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentTrack.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
              )}
              <div className="min-w-0">
                <p className="text-sm text-paper truncate">{currentTrack.name}</p>
                <p className="text-xs text-paper/50 truncate">{currentTrack.artists}</p>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs font-mono text-paper/40 mb-2">
          {upcoming.length > 0 ? `NEXT (${upcoming.length})` : "NOTHING QUEUED NEXT"}
        </p>
        <div className="space-y-1">
          {upcoming.map((t, i) => (
            <button
              key={t.id + i}
              onClick={() => {
                playAtOrderPos(orderPos + 1 + i);
                onClose();
              }}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-paper/5 text-left"
            >
              {t.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
              )}
              <div className="min-w-0">
                <p className="text-sm text-paper truncate">{t.name}</p>
                <p className="text-xs text-paper/50 truncate">{t.artists}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}