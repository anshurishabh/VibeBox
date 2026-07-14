# Undertone — mood & situation music recommender

A Next.js web app that recommends music based on your mood, detected three ways:
picking a mood, typing how you feel, or showing your face on webcam. Recommendations
come from Apple's free iTunes Search API, matched by mood-descriptive search terms.

## Why iTunes Search instead of Spotify?

This project originally used Spotify's Recommendations API. **Spotify deprecated that
endpoint (and audio-features/valence/energy data) for all new developer apps in
November 2024** — any app created after that date gets blocked, regardless of
credentials. There's no official replacement or waitlist.

So this app now uses Apple's iTunes Search API instead:
- No API key, no login, no developer account needed
- Returns 30-second preview URLs, artwork, and links to the full track
- Works immediately, out of the box

## 1. Install dependencies

```bash
npm install
```

## 2. Run it

```bash
npm run dev
```

Open http://localhost:3000. No environment variables or API keys required.

## 3. (Optional) Enable webcam mood detection

The "Show" tab uses [face-api.js](https://github.com/justadudewhohacks/face-api.js) for
in-browser facial expression detection. It needs model weight files that aren't bundled
here to keep the repo light:

1. Download the `tiny_face_detector` and `face_expression` model files from the
   face-api.js weights folder (search "face-api.js weights" on GitHub — the official
   repo's `weights` directory).
2. Place them in `public/models/`.

If you skip this step, the "Pick" and "Tell" tabs still work fully — only the webcam
tab will show an error.

## How it works

- `lib/moodMapping.js` — the core logic: maps a mood label to iTunes search terms,
  and combines signals from multiple detectors into one final mood + confidence.
- `lib/textSentiment.js` — a simple offline keyword classifier for the "Tell" tab.
  Swap this out for a real NLP/LLM call when you're ready (see "Next steps").
- `lib/musicSource.js` — builds the iTunes Search API request and shapes the response.
- `components/FaceMoodDetector.jsx` — webcam capture + face-api.js expression detection.
- `components/MoodOrb.jsx` — the signature visual: a blob that shifts color per mood.

## Troubleshooting

**Page keeps blinking / auto-reloading in the browser** — this usually means the dev
server's file-watcher is picking up constant changes to files in your project folder.
The most common cause is running the project from inside a folder synced by OneDrive
(e.g. `Downloads` on a work/school Windows account is often OneDrive-backed). Move the
project to a plain folder like `C:\Projects\mood-music-recommender` and restart
`npm run dev`.

**`fs`/`encoding` module not found warnings** — already handled in `next.config.js` via
a webpack fallback; if you still see them, make sure you're using the version of
`next.config.js` from this project.

## Next steps / ideas to extend this

- Replace the keyword-based text classifier with a real model call (HuggingFace
  emotion-classification model, or an LLM prompt asking for a JSON mood label).
- Add a "situation" dimension separate from mood — e.g. studying, working out,
  commuting, sleeping — as a second axis alongside mood.
- Try Apple Music's API (needs a developer account) or Deezer's API for a larger
  catalog and richer metadata than iTunes Search offers.
- Persist mood history over time (e.g. a mood journal + music log) using a database.
- Deploy: Vercel is the simplest option for a Next.js app like this.
