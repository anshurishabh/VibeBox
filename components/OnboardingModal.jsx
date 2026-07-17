"use client";
import { useEffect, useState } from "react";

const ONBOARDED_KEY = "vibebox:onboarded";

export default function OnboardingModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = window.localStorage.getItem(ONBOARDED_KEY);
    if (!seen) setShow(true);
  }, []);

  function dismiss() {
    window.localStorage.setItem(ONBOARDED_KEY, "true");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-ink border border-paper/10 p-6">
        <h2 className="font-display text-xl text-paper mb-2">Welcome to VibeBox 🎧</h2>
        <p className="font-body text-sm text-paper/60 mb-4">
          A quick look before you dive in:
        </p>
        <ul className="space-y-2 font-body text-sm text-paper/80 mb-6">
          <li>🙂 Tap the mood button (bottom-right) to get recommendations for how you feel</li>
          <li>📻 Tap the radio icon on any song to start a similar-songs playlist</li>
          <li>➕ Save songs to playlists, ❤️ favorite them</li>
          <li>⏰ Set a sleep timer from the player bar</li>
        </ul>
        <button
          onClick={dismiss}
          className="w-full px-4 py-2.5 rounded-full bg-paper text-ink text-sm font-body"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}