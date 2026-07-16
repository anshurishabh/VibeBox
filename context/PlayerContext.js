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

function shuffledKeepingFirst(identity, firstIndex) {
  const rest = identity.filter((i) => i !== firstIndex);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [firstIndex, ...rest];
}

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [order, setOrder] = useState([]);
  const [orderPos, setOrderPos] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off");
  const [volume, setVolumeState] = useState(80);
  const [sleepTimerEndsAt, setSleepTimerEndsAt] = useState(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(null);

  const containerRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const queueRef = useRef(queue);
  const orderRef = useRef(order);
  const orderPosRef = useRef(orderPos);
  const repeatModeRef = useRef(repeatMode);
  const volumeRef = useRef(volume);
  const sleepTimeoutRef = useRef(null);
  const sleepIntervalRef = useRef(null);

  queueRef.current = queue;
  orderRef.current = order;
  orderPosRef.current = orderPos;
  repeatModeRef.current = repeatMode;
  volumeRef.current = volume;

  const currentIndex = orderPos >= 0 ? order[orderPos] : -1;
  const currentTrack = currentIndex >= 0 ? queue[currentIndex] : null;

  function updateMediaSession(track) {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator) || !track) return;
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: track.name,
      artist: track.artists,
      album: track.album || "",
      artwork: track.image ? [{ src: track.image, sizes: "300x300", type: "image/jpeg" }] : [],
    });
  }

  const loadTrackAtQueueIndex = useCallback(async (queueIndex) => {
    const track = queueRef.current[queueIndex];
    if (!track) return;

    setStatus("loading");
    setErrorMessage(null);
    setCurrentTime(0);
    setDuration(0);
    try {
      const videoId = await resolveVideoId(track);
      if (ytPlayerRef.current?.loadVideoById) {
        ytPlayerRef.current.loadVideoById(videoId);
        setStatus("playing");
        setIsPlaying(true);
        addRecentlyPlayed(track);
        updateMediaSession(track);
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(`Couldn't play "${track.name}" - skipping.`);
      goToOffset(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goToOffset(direction) {
    const ord = orderRef.current;
    if (ord.length === 0) return;
    let newPos = orderPosRef.current + direction;

    if (newPos < 0) {
      if (repeatModeRef.current === "off") return;
      newPos = ord.length - 1;
    }
    if (newPos >= ord.length) {
      if (repeatModeRef.current === "off") {
        ytPlayerRef.current?.pauseVideo?.();
        setIsPlaying(false);
        return;
      }
      newPos = 0;
    }
    setOrderPos(newPos);
    loadTrackAtQueueIndex(ord[newPos]);
  }

  function playAtOrderPos(pos) {
    const ord = orderRef.current;
    if (pos < 0 || pos >= ord.length) return;
    setOrderPos(pos);
    loadTrackAtQueueIndex(ord[pos]);
  }

  useEffect(() => {
    const playerHost = document.createElement("div");
    containerRef.current.appendChild(playerHost);

    function createPlayer() {
      ytPlayerRef.current = new window.YT.Player(playerHost, {
        height: "1",
        width: "1",
        playerVars: { autoplay: 1, playsinline: 1 },
        events: {
          onReady: () => {
            ytPlayerRef.current?.setVolume?.(volumeRef.current);
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
            if (event.data === window.YT.PlayerState.ENDED) {
              if (repeatModeRef.current === "one") {
                ytPlayerRef.current.seekTo(0, true);
                ytPlayerRef.current.playVideo();
              } else {
                goToOffset(1);
              }
            }
          },
        },
      });

      if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", () => {
          ytPlayerRef.current?.playVideo();
          setIsPlaying(true);
        });
        navigator.mediaSession.setActionHandler("pause", () => {
          ytPlayerRef.current?.pauseVideo();
          setIsPlaying(false);
        });
        navigator.mediaSession.setActionHandler("previoustrack", () => goToOffset(-1));
        navigator.mediaSession.setActionHandler("nexttrack", () => goToOffset(1));
        navigator.mediaSession.setActionHandler("seekto", (details) => {
          if (details.seekTime != null) ytPlayerRef.current?.seekTo(details.seekTime, true);
        });
      }
    }

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    const pollId = setInterval(() => {
      const p = ytPlayerRef.current;
      if (p?.getCurrentTime && p?.getDuration) {
        setCurrentTime(p.getCurrentTime() || 0);
        setDuration(p.getDuration() || 0);
      }
    }, 500);

    return () => {
      clearInterval(pollId);
      clearTimeout(sleepTimeoutRef.current);
      clearInterval(sleepIntervalRef.current);
      try {
        ytPlayerRef.current?.destroy?.();
      } catch {}
      if (containerRef.current?.contains(playerHost)) containerRef.current.removeChild(playerHost);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playQueue = useCallback(
    (tracks, startIndex = 0) => {
      setQueue(tracks);
      const identity = tracks.map((_, i) => i);
      const newOrder = shuffle ? shuffledKeepingFirst(identity, startIndex) : identity;
      setOrder(newOrder);
      setOrderPos(newOrder.indexOf(startIndex));
      loadTrackAtQueueIndex(startIndex);
    },
    [loadTrackAtQueueIndex, shuffle]
  );

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => {
      const next = !prev;
      const q = queueRef.current;
      if (q.length > 0) {
        const curQueueIdx = orderRef.current[orderPosRef.current];
        if (next) {
          const identity = q.map((_, i) => i);
          const newOrder = shuffledKeepingFirst(identity, curQueueIdx);
          setOrder(newOrder);
          setOrderPos(0);
        } else {
          const identity = q.map((_, i) => i);
          setOrder(identity);
          setOrderPos(curQueueIdx);
        }
      }
      return next;
    });
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((prev) => (prev === "off" ? "all" : prev === "all" ? "one" : "off"));
  }, []);

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

  const seekTo = useCallback((seconds) => {
    const p = ytPlayerRef.current;
    if (p?.seekTo) {
      p.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  }, []);

  const setVolume = useCallback((v) => {
    setVolumeState(v);
    ytPlayerRef.current?.setVolume?.(v);
  }, []);

  const setSleepTimer = useCallback((minutes) => {
    clearTimeout(sleepTimeoutRef.current);
    clearInterval(sleepIntervalRef.current);

    if (!minutes) {
      setSleepTimerEndsAt(null);
      setSleepTimerRemaining(null);
      return;
    }

    const endsAt = Date.now() + minutes * 60 * 1000;
    setSleepTimerEndsAt(endsAt);
    setSleepTimerRemaining(minutes * 60);

    sleepIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
      setSleepTimerRemaining(remaining);
    }, 1000);

    sleepTimeoutRef.current = setTimeout(() => {
      ytPlayerRef.current?.pauseVideo?.();
      setIsPlaying(false);
      setSleepTimerEndsAt(null);
      setSleepTimerRemaining(null);
      clearInterval(sleepIntervalRef.current);
    }, minutes * 60 * 1000);
  }, []);

  const next = useCallback(() => goToOffset(1), []);
  const prev = useCallback(() => goToOffset(-1), []);

  const upcoming = orderPos >= 0 ? order.slice(orderPos + 1).map((i) => queue[i]) : [];

  return (
    <PlayerContext.Provider
      value={{
        queue, order, orderPos, currentIndex, currentTrack, upcoming,
        isPlaying, status, errorMessage, currentTime, duration,
        shuffle, repeatMode, volume, sleepTimerRemaining,
        playQueue, togglePlay, seekTo, setVolume, toggleShuffle, cycleRepeat,
        playAtOrderPos, setSleepTimer, next, prev,
      }}
    >
      {children}
      <div ref={containerRef} className="pointer-events-none opacity-0 fixed -z-10 w-1 h-1 overflow-hidden" />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider");
  return ctx;
}