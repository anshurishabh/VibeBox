// lib/languageDetect.js
//
// Script-based language guesser - no API needed. Latin-script text
// (English/Spanish/etc.) is intentionally left undetected here since they
// look identical by script alone - the browser-language default handles
// that case instead.

const SCRIPT_RANGES = [
  { id: "hindi", regex: /[\u0900-\u097F]/ },      // Devanagari (Hindi/Marathi)
  { id: "punjabi", regex: /[\u0A00-\u0A7F]/ },     // Gurmukhi
  { id: "bengali", regex: /[\u0980-\u09FF]/ },
  { id: "gujarati", regex: /[\u0A80-\u0AFF]/ },
  { id: "tamil", regex: /[\u0B80-\u0BFF]/ },
  { id: "telugu", regex: /[\u0C00-\u0C7F]/ },
  { id: "korean", regex: /[\uAC00-\uD7AF]/ },
  { id: "japanese", regex: /[\u3040-\u30FF\u4E00-\u9FFF]/ },
  { id: "arabic", regex: /[\u0600-\u06FF]/ },
];

export function detectLanguageFromText(text) {
  if (!text) return null;
  for (const { id, regex } of SCRIPT_RANGES) {
    if (regex.test(text)) return id;
  }
  return null;
}

const BROWSER_LANG_MAP = {
  en: "english", hi: "hindi", pa: "punjabi", ta: "tamil", te: "telugu",
  bn: "bengali", mr: "marathi", gu: "gujarati", ko: "korean", ja: "japanese",
  ar: "arabic", es: "spanish",
};

export function detectLanguageFromBrowser() {
  if (typeof navigator === "undefined") return "any";
  const primary = (navigator.language || "en").split("-")[0].toLowerCase();
  return BROWSER_LANG_MAP[primary] || "any";
}