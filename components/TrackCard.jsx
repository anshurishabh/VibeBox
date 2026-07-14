"use client";
import { useState } from "react";

export default function TrackCard({ track }) {
  const [videoId, setVideoId] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [videoError, setVideoError] = useState(null);

  async function playFullSong() {
    setLoadingVideo(true);
    setVideoError(null);
    try {
      const res = await fetch("/api/youtube/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `${track.artists} ${track.name} official audio` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not find video");
      setVideoId(data.videoId);
    } catch (err) {
      setVideoError(err.message);
    } finally {
      setLoadingVideo(false);
    }
  }

  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-paper/10 bg-paper/5 p-3 hover:border-paper/30 transition">
      <a href={track.externalUrl} target="_blank" rel="noreferrer">
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
        <div className="mt-2">
          <p className="font-body text-sm text-paper truncate">{track.name}</p>
          <p className="font-body text-xs text-paper/50 truncate">{track.artists}</p>
        </div>
      </a>

      {videoId ? (
        <div className="aspect-video w-full rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={`${track.name} player`}
          />
        </div>
      ) : (
        <button
          onClick={playFullSong}
          disabled={loadingVideo}
          className="w-full py-2 rounded-full bg-paper text-ink text-xs font-body disabled:opacity-40"
        >
          {loadingVideo ? "Finding video…" : "▶ Play full song"}
        </button>
      )}

      {videoError && <p className="text-xs text-moods-stressed font-body">{videoError}</p>}

      {track.previewUrl && (
        <audio controls src={track.previewUrl} className="w-full h-8" />
      )}
    </div>
  );
}