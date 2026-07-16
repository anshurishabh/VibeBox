// lib/localLists.js
const FAVORITES_KEY = "vibebox:favorites";
const RECENTLY_PLAYED_KEY = "vibebox:recently-played";
const PLAYLISTS_KEY = "vibebox:playlists";
const MAX_RECENTLY_PLAYED = 30;

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
  } catch {}
}

function genId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

// --- Favorites ---
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
  if (typeof window !== "undefined") window.dispatchEvent(new Event("favorites:changed"));
  return !exists;
}

// --- Recently played ---
export function getRecentlyPlayed() {
  return readList(RECENTLY_PLAYED_KEY);
}

export function addRecentlyPlayed(track) {
  const list = getRecentlyPlayed().filter((t) => t.id !== track.id);
  const next = [track, ...list].slice(0, MAX_RECENTLY_PLAYED);
  writeList(RECENTLY_PLAYED_KEY, next);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("recently-played:changed"));
  return next;
}

// --- Playlists ---
export function getPlaylists() {
  return readList(PLAYLISTS_KEY);
}

export function getPlaylist(id) {
  return getPlaylists().find((p) => p.id === id) || null;
}

function saveAndNotifyPlaylists(list) {
  writeList(PLAYLISTS_KEY, list);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("playlists:changed"));
}

export function createPlaylist(name) {
  const list = getPlaylists();
  const playlist = { id: genId(), name: name.trim() || "Untitled Playlist", tracks: [], createdAt: Date.now() };
  saveAndNotifyPlaylists([playlist, ...list]);
  return playlist;
}

export function deletePlaylist(id) {
  saveAndNotifyPlaylists(getPlaylists().filter((p) => p.id !== id));
}

export function renamePlaylist(id, newName) {
  const list = getPlaylists().map((p) => (p.id === id ? { ...p, name: newName.trim() || p.name } : p));
  saveAndNotifyPlaylists(list);
}

export function isTrackInPlaylist(playlistId, trackId) {
  const p = getPlaylist(playlistId);
  return p ? p.tracks.some((t) => t.id === trackId) : false;
}

export function addTrackToPlaylist(playlistId, track) {
  const list = getPlaylists().map((p) => {
    if (p.id !== playlistId) return p;
    if (p.tracks.some((t) => t.id === track.id)) return p;
    return { ...p, tracks: [...p.tracks, track] };
  });
  saveAndNotifyPlaylists(list);
}

export function removeTrackFromPlaylist(playlistId, trackId) {
  const list = getPlaylists().map((p) =>
    p.id === playlistId ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) } : p
  );
  saveAndNotifyPlaylists(list);
}