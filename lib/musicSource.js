// lib/musicSource.js
import { MOOD_SEARCH_TERMS, LANGUAGES } from "./moodMapping";

const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";

function shapeTrack(t) {
  return {
    id: String(t.trackId),
    name: t.trackName,
    artists: t.artistName,
    album: t.collectionName,
    genre: t.primaryGenreName || null,
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
  return (data.results || []).filter((t) => t.previewUrl).map(shapeTrack);
}

export async function getRecommendations({ mood, language = "any" }) {
  const moodTerm = MOOD_SEARCH_TERMS[mood] || MOOD_SEARCH_TERMS.neutral;
  const lang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];
  const term = lang.term ? `${lang.term} ${moodTerm}` : moodTerm;
  return runSearch({ term, country: lang.country });
}

export async function searchTracks({ query, country = "US" }) {
  if (!query?.trim()) return [];
  return runSearch({ term: query.trim(), country, limit: 16 });
}

export async function browseTracks({ term, country = "US", limit = 12 }) {
  if (!term?.trim()) return [];
  return runSearch({ term: term.trim(), country, limit });
}