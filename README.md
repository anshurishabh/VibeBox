<<<<<<< HEAD
# Undertone — mood & situation music recommender

A Next.js web app that recommends music based on your mood, detected three ways:
picking a mood, typing how you feel, or showing your face on webcam. Recommendations
come from Spotify's catalog, matched by audio-feature targets (valence, energy, tempo).

## 1. Install dependencies

```bash
npm install
```

## 2. Set up Spotify API credentials

1. Go to https://developer.spotify.com/dashboard and log in / sign up.
2. Click **Create app**. Fill in any name/description.
   - Redirect URI: `http://localhost:3000/api/spotify/callback` (not used by the current
     client-credentials flow, but Spotify requires one to be set).
3. Copy the **Client ID** and **Client Secret**.
4. Copy `.env.local.example` to `.env.local` and paste them in:

```bash
cp .env.local.example .env.local
```

This MVP uses Spotify's **Client Credentials** flow (app-only access), so there's no
user login step — it can query the public catalog and recommendations endpoint
immediately, which is enough for mood-based discovery.

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

## 4. Run it

```bash
npm run dev
```

Open http://localhost:3000.

## How it works

- `lib/moodMapping.js` — the core logic: maps a mood label to Spotify audio-feature
  targets, and combines signals from multiple detectors into one final mood + confidence.
- `lib/textSentiment.js` — a simple offline keyword classifier for the "Tell" tab.
  Swap this out for a real NLP/LLM call when you're ready (see "Next steps").
- `lib/spotify.js` — Spotify auth + recommendations request builder.
- `components/FaceMoodDetector.jsx` — webcam capture + face-api.js expression detection.
- `components/MoodOrb.jsx` — the signature visual: a blob that shifts color per mood.

## Next steps / ideas to extend this

- Replace the keyword-based text classifier with a real model call (HuggingFace
  emotion-classification model, or an LLM prompt asking for a JSON mood label).
- Add real Spotify user login (authorization code flow) to base recommendations on
  the person's own listening history and top artists, not just genre seeds.
- Persist mood history over time (e.g. a mood journal + music log) using a database.
- Add a "situation" dimension separate from mood — e.g. studying, working out,
  commuting, sleeping — as a second axis alongside mood.
- Deploy: Vercel is the simplest option for a Next.js app like this.
=======
# VibeBox
Music That Understands You
>>>>>>> 1fc08813cb85eb6ba46ad2f733a1a515bf8a3bef
