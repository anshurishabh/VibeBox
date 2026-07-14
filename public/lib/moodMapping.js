// lib/moodMapping.js
//
// Maps a mood label to Spotify "target audio feature" ranges.
// valence: musical positivity (0 sad/negative -> 1 happy/positive)
// energy: intensity/activity (0 calm -> 1 energetic)
// tempo: approximate BPM center
// danceability: 0 -> 1

export const MOODS = [
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "sad", label: "Sad", emoji: "😢" },
  { id: "energetic", label: "Energetic", emoji: "⚡" },
  { id: "calm", label: "Calm", emoji: "🌙" },
  { id: "stressed", label: "Stressed", emoji: "😩" },
  { id: "romantic", label: "Romantic", emoji: "💕" },
  { id: "neutral", label: "Neutral", emoji: "🙂" },
];

export const MOOD_AUDIO_TARGETS = {
  happy: { valence: 0.8, energy: 0.65, tempo: 118, danceability: 0.7 },
  sad: { valence: 0.2, energy: 0.3, tempo: 80, danceability: 0.35 },
  energetic: { valence: 0.65, energy: 0.9, tempo: 135, danceability: 0.75 },
  calm: { valence: 0.5, energy: 0.2, tempo: 75, danceability: 0.4 },
  stressed: { valence: 0.35, energy: 0.25, tempo: 70, danceability: 0.3 },
  romantic: { valence: 0.6, energy: 0.4, tempo: 95, danceability: 0.5 },
  neutral: { valence: 0.5, energy: 0.5, tempo: 100, danceability: 0.5 },
};

// Search terms used against Apple's iTunes Search API (no auth required).
// Spotify deprecated its Recommendations + audio-features endpoints for new
// apps in Nov 2024, so we search by mood-descriptive keywords instead of
// querying by audio-feature targets.
export const MOOD_SEARCH_TERMS = {
  happy: "feel good happy pop songs",
  sad: "sad emotional acoustic songs",
  energetic: "energetic workout dance songs",
  calm: "calm relaxing chill songs",
  stressed: "stress relief soothing songs",
  romantic: "romantic love songs",
  neutral: "popular hits",
};

// Languages the person can filter mood-based results by. `term` is prefixed
// onto the mood search query; `country` picks the closest iTunes storefront
// so regional catalogs (e.g. Bollywood, K-pop) surface properly.
export const LANGUAGES = [
  { id: "any", label: "Any language", term: "", country: "US" },
  { id: "hindi", label: "Hindi", term: "hindi bollywood", country: "IN" },
  { id: "english", label: "English", term: "english", country: "US" },
  { id: "punjabi", label: "Punjabi", term: "punjabi", country: "IN" },
  { id: "tamil", label: "Tamil", term: "tamil", country: "IN" },
  { id: "telugu", label: "Telugu", term: "telugu", country: "IN" },
  { id: "bengali", label: "Bengali", term: "bengali", country: "IN" },
  { id: "marathi", label: "Marathi", term: "marathi", country: "IN" },
  { id: "gujarati", label: "Gujarati", term: "gujarati", country: "IN" },
  { id: "spanish", label: "Spanish", term: "spanish", country: "US" },
  { id: "korean", label: "Korean (K-pop)", term: "korean kpop", country: "KR" },
  { id: "japanese", label: "Japanese", term: "japanese", country: "JP" },
  { id: "arabic", label: "Arabic", term: "arabic", country: "US" },
];


 * one final mood + confidence. Each input is optional.
 *
 * @param {{ manual?: string, text?: {mood: string, confidence: number}, face?: {mood: string, confidence: number} }} signals
 */
export function resolveFinalMood(signals) {
  const weights = [];

  if (signals.manual) {
    // Manual selection is an explicit, deliberate signal - weight it highest.
    weights.push({ mood: signals.manual, weight: 1.0 });
  }
  if (signals.text?.mood) {
    weights.push({ mood: signals.text.mood, weight: 0.7 * (signals.text.confidence ?? 0.6) });
  }
  if (signals.face?.mood) {
    weights.push({ mood: signals.face.mood, weight: 0.6 * (signals.face.confidence ?? 0.6) });
  }

  if (weights.length === 0) return { mood: "neutral", confidence: 0 };

  const totals = {};
  for (const { mood, weight } of weights) {
    totals[mood] = (totals[mood] || 0) + weight;
  }

  const [finalMood, score] = Object.entries(totals).sort((a, b) => b[1] - a[1])[0];
  const totalWeight = weights.reduce((s, w) => s + w.weight, 0);

  return { mood: finalMood, confidence: totalWeight > 0 ? score / totalWeight : 0 };
}
