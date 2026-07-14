// lib/moodMapping.js

export const MOODS = [
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "sad", label: "Sad", emoji: "😢" },
  { id: "energetic", label: "Energetic", emoji: "⚡" },
  { id: "calm", label: "Calm", emoji: "🌙" },
  { id: "stressed", label: "Stressed", emoji: "😩" },
  { id: "romantic", label: "Romantic", emoji: "💕" },
  { id: "neutral", label: "Neutral", emoji: "🙂" },
];

export const MOOD_SEARCH_TERMS = {
  happy: "feel good happy pop songs",
  sad: "sad emotional acoustic songs",
  energetic: "energetic workout dance songs",
  calm: "calm relaxing chill songs",
  stressed: "stress relief soothing songs",
  romantic: "romantic love songs",
  neutral: "popular hits",
};

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

export const CATEGORIES = [
  { id: "romantic", label: "Romantic", term: "romantic love songs" },
  { id: "happy", label: "Happy", term: "feel good happy pop songs" },
  { id: "sad", label: "Sad", term: "sad emotional songs" },
  { id: "chill", label: "Chill", term: "chill relaxing songs" },
  { id: "lofi", label: "Lo-Fi", term: "lofi beats" },
  { id: "workout", label: "Workout", term: "workout gym motivation songs" },
  { id: "party", label: "Party", term: "party dance hits" },
  { id: "devotional", label: "Devotional", term: "devotional bhajan songs" },
  { id: "study", label: "Study", term: "study focus instrumental" },
  { id: "sleep", label: "Sleep", term: "sleep calm ambient" },
];

export function resolveFinalMood(signals) {
  const weights = [];

  if (signals.manual) {
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