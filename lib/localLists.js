// lib/localLists.js
const FAVORITES_KEY = "vibebox:favorites";
const RECENTLY_PLAYED_KEY = "vibebox:recently-played";
const PLAYLISTS_KEY = "vibebox:playlists";
const PLAY_STATS_KEY = "vibebox:play-stats";
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
  recordPlayStats(track);
  return next;
}

// --- Play stats (uncapped counters, used by the Stats page) ---
function getPlayStatsRaw() {
  if (typeof window === "undefined") return { artists: {}, genres: {}, totalPlays: 0 };
  try {
    const raw = window.localStorage.getItem(PLAY_STATS_KEY);
    return raw ? JSON.parse(raw) : { artists: {}, genres: {}, totalPlays: 0 };
  } catch {
    return { artists: {}, genres: {}, totalPlays: 0 };
  }
}

function recordPlayStats(track) {
  if (typeof window === "undefined") return;
  const stats = getPlayStatsRaw();
  stats.totalPlays = (stats.totalPlays || 0) + 1;
  if (track.artists) stats.artists[track.artists] = (stats.artists[track.artists] || 0) + 1;
  if (track.genre) stats.genres[track.genre] = (stats.genres[track.genre] || 0) + 1;
  try {
    window.localStorage.setItem(PLAY_STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function getPlayStats() {
  const stats = getPlayStatsRaw();
  const topArtists = Object.entries(stats.artists || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topGenres = Object.entries(stats.genres || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return { totalPlays: stats.totalPlays || 0, topArtists, topGenres };
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
}// --- Backup / restore (export everything to a JSON file, or import it back) ---
export function exportAllData() {
  return JSON.stringify(
    {
      favorites: getFavorites(),
      recentlyPlayed: getRecentlyPlayed(),
      playlists: getPlaylists(),
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}

export function importAllData(jsonString) {
  const data = JSON.parse(jsonString);
  if (data.favorites) writeList(FAVORITES_KEY, data.favorites);
  if (data.recentlyPlayed) writeList(RECENTLY_PLAYED_KEY, data.recentlyPlayed);
  if (data.playlists) writeList(PLAYLISTS_KEY, data.playlists);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("favorites:changed"));
    window.dispatchEvent(new Event("recently-played:changed"));
    window.dispatchEvent(new Event("playlists:changed"));
  }
}
// --- Recent searches ---
const RECENT_SEARCHES_KEY = "vibebox:recent-searches";
const MAX_RECENT_SEARCHES = 8;

export function getRecentSearches() {
  return readList(RECENT_SEARCHES_KEY);
}

export function addRecentSearch(query) {
  const q = query.trim();
  if (!q) return;
  const list = getRecentSearches().filter((s) => s.toLowerCase() !== q.toLowerCase());
  const next = [q, ...list].slice(0, MAX_RECENT_SEARCHES);
  writeList(RECENT_SEARCHES_KEY, next);
}

export function clearRecentSearches() {
  writeList(RECENT_SEARCHES_KEY, []);
}