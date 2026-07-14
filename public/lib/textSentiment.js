// lib/textSentiment.js
//
// A dependency-free, offline keyword classifier. Good enough for an MVP;
// swap out `classifyText` for a call to an LLM or HuggingFace model later
// (see README) without touching any calling code.

const KEYWORDS = {
  happy: ["happy", "great", "excited", "awesome", "joy", "celebrat", "smil", "good day", "amazing"],
  sad: ["sad", "down", "crying", "heartbroken", "lonely", "miss", "depress", "hurt", "grief"],
  energetic: ["pumped", "workout", "gym", "run", "party", "hyped", "energy", "dance"],
  calm: ["relax", "calm", "peaceful", "chill", "unwind", "quiet", "meditat", "rest"],
  stressed: ["stress", "anxious", "overwhelm", "deadline", "exhausted", "tired", "long day", "pressure"],
  romantic: ["love", "romantic", "date", "crush", "valentine", "kiss", "together forever"],
};

export function classifyText(input) {
  const text = (input || "").toLowerCase();
  if (!text.trim()) return { mood: "neutral", confidence: 0 };

  const scores = {};
  for (const [mood, words] of Object.entries(KEYWORDS)) {
    scores[mood] = words.reduce((count, w) => (text.includes(w) ? count + 1 : count), 0);
  }

  const [topMood, hits] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  if (hits === 0) return { mood: "neutral", confidence: 0.3 };

  // Simple confidence: more keyword hits -> higher confidence, capped at 0.95
  const confidence = Math.min(0.5 + hits * 0.15, 0.95);
  return { mood: topMood, confidence };
}
