// lib/radio.js
export async function fetchRadioTracks(seedTrack) {
  const term = seedTrack.genre
    ? `${seedTrack.genre} songs`
    : `${seedTrack.artists} similar songs`;

  const res = await fetch("/api/music/browse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ term, country: "US", limit: 25 }),
  });
  const data = await res.json();
  const tracks = data.tracks || [];

  // Put the seed track first so playback starts with the song the person picked.
  const withoutSeed = tracks.filter((t) => t.id !== seedTrack.id);
  return [seedTrack, ...withoutSeed];
}