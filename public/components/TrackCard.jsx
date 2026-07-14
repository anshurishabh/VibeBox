"use client";

export default function TrackCard({ track }) {
  return (
    <a
      href={track.externalUrl}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col gap-3 rounded-2xl border border-paper/10 bg-paper/5 p-3 hover:border-paper/30 transition"
    >
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-ink/40">
        {track.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.image}
            alt={track.album}
            className="h-full w-full object-cover group-hover:scale-105 transition"
          />
        )}
      </div>
      <div>
        <p className="font-body text-sm text-paper truncate">{track.name}</p>
        <p className="font-body text-xs text-paper/50 truncate">{track.artists}</p>
      </div>
      {track.previewUrl && (
        <audio controls src={track.previewUrl} className="w-full h-8" onClick={(e) => e.stopPropagation()} />
      )}
    </a>
  );
}
