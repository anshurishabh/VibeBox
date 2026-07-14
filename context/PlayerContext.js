"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { addRecentlyPlayed } from "../lib/localLists";

const PlayerContext = createContext(null);
const videoIdCache = new Map();

async function resolveVideoId(track) {
  if (videoIdCache.has(track.id)) return videoIdCache.get(track.id);

  const res = await fetch("/api/youtube/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: `${track.artists} ${track.name} official audio` }),
  });
  const data = await res.json();
  if (!res.ok || !data.videoId) throw new Error(data.error || "Video not found");

  videoIdCache.set(track.id, data.videoId);
  return data.videoId;
}

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState(null);

  const containerRef = useRef(null); // React-owned, stays empty forever in JSX
  const ytPlayerRef = useRef(null);
  const queueRef = useRef(queue);
  const indexRef = useRef(currentIndex);

  queueRef.current = queue;
  indexRef.current = currentIndex;

  const currentTrack = currentIndex >= 0 ? queue[currentIndex] : null;

  function goToOffset(offset) {
    const q = queueRef.current;
    if (q.length === 0) return;
    let nextIndex = indexRef.current + offset;
    if (nextIndex < 0) nextIndex = q.length - 1;
    if (nextIndex >= q.length) nextIndex = 0;
    setCurrentIndex(nextIndex);
    loadTrackAtIndex(nextIndex);
  }

  const loadTrackAtIndex = useCallback(async (index) => {
    const q = queueRef.current;
    const track = q[index];
    if (!track) return;

    setStatus("loading");
    setErrorMessage(null);
    try {
      const videoId = await resolveVideoId(track);
      if (ytPlayerRef.current?.loadVideoById) {
        ytPlayerRef.current.loadVideoById(videoId);
        setStatus("playing");
        setIsPlaying(true);
        addRecentlyPlayed(track);
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(`Couldn't play "${track.name}" - skipping.`);
      goToOffset(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Create a PLAIN DOM node that React never renders/tracks. YouTube's
    // player replaces this node with its own iframe - if React had created
    // this node via JSX, that swap would break React's reconciliation
    // (causes "insertBefore/removeChild - not a child of this node" errors).
    const playerHost = document.createElement("div");
    containerRef.current.appendChild(playerHost);

    function createPlayer() {
      ytPlayerRef.current = new window.YT.Player(playerHost, {
        height: "1",
        width: "1",
        playerVars: { autoplay: 1, playsinline: 1 },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
            if (event.data === window.YT.PlayerState.ENDED) goToOffset(1);
          },
        },
      });
    }

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      // Clean up on unmount (rare in dev with Fast Refresh, but keeps things tidy)
      try {
        ytPlayerRef.current?.destroy?.();
      } catch {}
      if (containerRef.current?.contains(playerHost)) {
        containerRef.current.removeChild(playerHost);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playQueue = useCallback(
    (tracks, startIndex = 0) => {
      setQueue(tracks);
      setCurrentIndex(startIndex);
      loadTrackAtIndex(startIndex);
    },
    [loadTrackAtIndex]
  );

  const togglePlay = useCallback(() => {
    const p = ytPlayerRef.current;
    if (!p) return;
    if (isPlaying) {
      p.pauseVideo();
      setIsPlaying(false);
    } else {
      p.playVideo();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const next = useCallback(() => goToOffset(1), []);
  const prev = useCallback(() => goToOffset(-1), []);

  return (
    <PlayerContext.Provider
      value={{ queue, currentIndex, currentTrack, isPlaying, status, errorMessage, playQueue, togglePlay, next, prev }}
    >
      {children}
      {/* Empty in JSX on purpose - see comment above about why */}
      <div ref={containerRef} className="pointer-events-none opacity-0 fixed -z-10 w-1 h-1 overflow-hidden" />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider");
  return ctx;
}