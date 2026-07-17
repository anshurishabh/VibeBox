"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { addRecentlyPlayed } from "../lib/localLists";

const PlayerContext = createContext(null);
const videoIdCache = new Map();
const CROSSFADE_SECONDS = 4;

async function resolveVideoId(track) {
  if (videoIdCache.has(track.id)) return videoIdCache.get(track.id);
  const res = await fetch("/api/youtube/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: track.artists + " " + track.name + " official audio" }),
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
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(true);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(null);

  const containerRef = useRef(null);
  const playersRef = useRef({ A: null, B: null });
  const activeKeyRef = useRef("A");
  const crossfadingRef = useRef(false);
  const crossfadeHandledForRef = useRef(null);

  const queueRef = useRef(queue);
  const orderRef = useRef(order);
  const orderPosRef = useRef(orderPos);
  const repeatModeRef = useRef(repeatMode);
  const volumeRef = useRef(volume);
  const crossfadeEnabledRef = useRef(crossfadeEnabled);
  const sleepTimeoutRef = useRef(null);
  const sleepIntervalRef = useRef(null);

  queueRef.current = queue;
  orderRef.current = order;
  orderPosRef.current = orderPos;
  repeatModeRef.current = repeatMode;
  volumeRef.current = volume;
  crossfadeEnabledRef.current = crossfadeEnabled;

  const currentIndex = orderPos >= 0 ? order[orderPos] : -1;
  const currentTrack = currentIndex >= 0 ? queue[currentIndex] : null;

  function activePlayer() {
    return playersRef.current[activeKeyRef.current];
  }
  function inactivePlayer() {
    return playersRef.current[activeKeyRef.current === "A" ? "B" : "A"];
  }

  function updateMediaSession(track) {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator) || !track) return;
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: track.name,
      artist: track.artists,
      album: track.album || "",
      artwork: track.image ? [{ src: track.image, sizes: "300x300", type: "image/jpeg" }] : [],
    });
  }

  const loadTrackAtQueueIndex = useCallback(async (queueIndex, { crossfade = false } = {}) => {
    const track = queueRef.current[queueIndex];
    if (!track) return;

    crossfadeHandledForRef.current = null;
    setStatus("loading");
    setErrorMessage(null);

    try {
      const videoId = await resolveVideoId(track);

      if (crossfade && crossfadeEnabledRef.current) {
        const outgoing = activePlayer();
        const incoming = inactivePlayer();
        incoming.mute();
        incoming.loadVideoById(videoId);
        incoming.setVolume(0);
        incoming.playVideo();

        crossfadingRef.current = true;
        const steps = 20;
        const stepMs = (CROSSFADE_SECONDS * 1000) / steps;
        let i = 0;
        const targetVol = volumeRef.current;

        const fadeInterval = setInterval(() => {
          i++;
          const ratio = i / steps;
          try {
            outgoing.setVolume(Math.max(0, targetVol * (1 - ratio)));
            incoming.setVolume(Math.min(targetVol, targetVol * ratio));
          } catch {}
          if (i >= steps) {
            clearInterval(fadeInterval);
            try {
              outgoing.pauseVideo();
              incoming.unMute();
              incoming.setVolume(targetVol);
            } catch {}
            activeKeyRef.current = activeKeyRef.current === "A" ? "B" : "A";
            crossfadingRef.current = false;
          }
        }, stepMs);

        setStatus("playing");
        setIsPlaying(true);
        addRecentlyPlayed(track);
        updateMediaSession(track);
      } else {
        const p = activePlayer();
        p.setVolume(volumeRef.current);
        p.loadVideoById(videoId);
        setStatus("playing");
        setIsPlaying(true);
        addRecentlyPlayed(track);
        updateMediaSession(track);
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage('Couldn\'t play "' + track.name + '" - skipping.');
      goToOffset(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goToOffset(direction, opts) {
    const ord = orderRef.current;
    if (ord.length === 0) return;
    let newPos = orderPosRef.current + direction;

    if (newPos < 0) {
      if (repeatModeRef.current === "off") return;
      newPos = ord.length - 1;
    }
    if (newPos >= ord.length) {
      if (repeatModeRef.current === "off") {
        activePlayer()?.pauseVideo?.();
        setIsPlaying(false);
        return;
      }
      newPos = 0;
    }
    setOrderPos(newPos);
    loadTrackAtQueueIndex(ord[newPos], opts);
  }

  function playAtOrderPos(pos) {
    const ord = orderRef.current;
    if (pos < 0 || pos >= ord.length) return;
    setOrderPos(pos);
    loadTrackAtQueueIndex(ord[pos]);
  }

  useEffect(() => {
    const hostA = document.createElement("div");
    const hostB = document.createElement("div");
    containerRef.current.appendChild(hostA);
    containerRef.current.appendChild(hostB);

    function makePlayer(host, key) {
      return new window.YT.Player(host, {
        height: "1",
        width: "1",
        playerVars: { autoplay: key === "A" ? 1 : 0, playsinline: 1 },
        events: {
          onReady: () => {
            playersRef.current[key].setVolume(key === activeKeyRef.current ? volumeRef.current : 0);
          },
          onStateChange: (event) => {
            if (key !== activeKeyRef.current) return; // ignore inactive/preloading player's events
            if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
            if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
            if (event.data === window.YT.PlayerState.ENDED) {
              if (repeatModeRef.current === "one") {
                activePlayer().seekTo(0, true);
                activePlayer().playVideo();
              } else {
                goToOffset(1);
              }
            }
          },
        },
      });
    }

    function createPlayers() {
      playersRef.current.A = makePlayer(hostA, "A");
      playersRef.current.B = makePlayer(hostB, "B");

      if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", () => {
          activePlayer()?.playVideo();
          setIsPlaying(true);
        });
        navigator.mediaSession.setActionHandler("pause", () => {
          activePlayer()?.pauseVideo();
          setIsPlaying(false);
        });
        navigator.mediaSession.setActionHandler("previoustrack", () => goToOffset(-1));
        navigator.mediaSession.setActionHandler("nexttrack", () => goToOffset(1));
        navigator.mediaSession.setActionHandler("seekto", (details) => {
          if (details.seekTime != null) activePlayer()?.seekTo(details.seekTime, true);
        });
      }
    }

    if (window.YT && window.YT.Player) {
      createPlayers();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = createPlayers;
    }

    const pollId = setInterval(() => {
      const p = activePlayer();
      if (!p?.getCurrentTime || !p?.getDuration) return;
      const t = p.getCurrentTime() || 0;
      const d = p.getDuration() || 0;
      setCurrentTime(t);
      setDuration(d);

      // Trigger crossfade a few seconds before the track naturally ends.
      const ord = orderRef.current;
      const pos = orderPosRef.current;
      const hasNext = repeatModeRef.current !== "off" || pos < ord.length - 1;
      if (
        crossfadeEnabledRef.current &&
        !crossfadingRef.current &&
        d > CROSSFADE_SECONDS * 2 &&
        d - t <= CROSSFADE_SECONDS &&
        hasNext &&
        repeatModeRef.current !== "one" &&
        crossfadeHandledForRef.current !== pos
      ) {
        crossfadeHandledForRef.current = pos;
        goToOffset(1, { crossfade: true });
      }
    }, 300);

    return () => {
      clearInterval(pollId);
      clearTimeout(sleepTimeoutRef.current);
      clearInterval(sleepIntervalRef.current);
      try {
        playersRef.current.A?.destroy?.();
        playersRef.current.B?.destroy?.();
      } catch {}
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
    const p = activePlayer();
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
    const p = activePlayer();
    if (p?.seekTo) {
      p.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  }, []);

  const setVolume = useCallback((v) => {
    setVolumeState(v);
    if (!crossfadingRef.current) activePlayer()?.setVolume?.(v);
  }, []);

  const toggleCrossfade = useCallback(() => setCrossfadeEnabled((v) => !v), []);

  const setSleepTimer = useCallback((minutes) => {
    clearTimeout(sleepTimeoutRef.current);
    clearInterval(sleepIntervalRef.current);
    if (!minutes) {
      setSleepTimerRemaining(null);
      return;
    }
    const endsAt = Date.now() + minutes * 60 * 1000;
    setSleepTimerRemaining(minutes * 60);
    sleepIntervalRef.current = setInterval(() => {
      setSleepTimerRemaining(Math.max(0, Math.round((endsAt - Date.now()) / 1000)));
    }, 1000);
    sleepTimeoutRef.current = setTimeout(() => {
      activePlayer()?.pauseVideo?.();
      setIsPlaying(false);
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
        shuffle, repeatMode, volume, crossfadeEnabled, sleepTimerRemaining,
        playQueue, togglePlay, seekTo, setVolume, toggleShuffle, cycleRepeat,
        toggleCrossfade, playAtOrderPos, setSleepTimer, next, prev,
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