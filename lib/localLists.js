// lib/localLists.js
//
// No backend/database in this phase - favorites and recently-played are
// kept in the browser's localStorage.

const FAVORITES_KEY = "undertone:favorites";
const RECENTLY_PLAYED_KEY = "undertone:recently-played";
const MAX_RECENTLY_PLAYED = 20;

function readList(key) {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    // storage full/unavailable - fail silently
  }
}

export function getFavorites() {
  return readList(FAVORITES_KEY);
}

export function isFavorite(trackId) {
  return getFavorites().some((t) => t.id === trackId);
}

export function toggleFavorite(track) {
  const list = getFavorites();
  const exists = list.some((t) => t.id === track.id);
  const next = exists ? list.filter((t) => t.id !== track.id) : [track, ...list];
  writeList(FAVORITES_KEY, next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("favorites:changed"));
  }
  return !exists;
}

export function getRecentlyPlayed() {
  return readList(RECENTLY_PLAYED_KEY);
}

export function addRecentlyPlayed(track) {
  const list = getRecentlyPlayed().filter((t) => t.id !== track.id);
  const next = [track, ...list].slice(0, MAX_RECENTLY_PLAYED);
  writeList(RECENTLY_PLAYED_KEY, next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("recently-played:changed"));
  }
  return next;
}