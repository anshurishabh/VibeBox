// lib/musicSource.js
//
// Uses Apple's public iTunes Search API to find tracks matching a mood.
// No API key, no login, no rate-limit hassle for a small app like this -
// see README for why we moved off Spotify's Recommendations endpoint.
import { MOOD_SEARCH_TERMS, LANGUAGES } from "./moodMapping";

const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";

function shapeTrack(t) {
  return {
    id: String(t.trackId),
    name: t.trackName,
    artists: t.artistName,
    album: t.collectionName,
    // upgrade the tiny default thumbnail to a bigger one
    image: t.artworkUrl100?.replace("100x100", "300x300"),
    previewUrl: t.previewUrl,
    externalUrl: t.trackViewUrl,
  };
}

async function runSearch({ term, country, limit = 12 }) {
  const params = new URLSearchParams({
    term,
    media: "music",
    entity: "song",
    limit: String(limit),
    country,
  });

  const res = await fetch(`${ITUNES_SEARCH_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`iTunes search request failed: ${res.status}`);

  const data = await res.json();
  return (data.results || [])
    .filter((t) => t.previewUrl) // only show tracks we can actually preview
    .map(shapeTrack);
}

// Mood-based discovery, optionally narrowed to a language/region.
export async function getRecommendations({ mood, language = "any" }) {
  const moodTerm = MOOD_SEARCH_TERMS[mood] || MOOD_SEARCH_TERMS.neutral;
  const lang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];
  const term = lang.term ? `${lang.term} ${moodTerm}` : moodTerm;

  return runSearch({ term, country: lang.country });
}

// Direct search by song/artist name, independent of mood.
export async function searchTracks({ query, country = "US" }) {
  if (!query?.trim()) return [];
  return runSearch({ term: query.trim(), country, limit: 16 });
}

