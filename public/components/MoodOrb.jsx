"use client";

const MOOD_HEX = {
  happy: "#4ECDC4",
  sad: "#5B5F97",
  energetic: "#FF6B4A",
  calm: "#8C9EFF",
  stressed: "#C94B4B",
  romantic: "#E88AAE",
  neutral: "#8A8B93",
};

export default function MoodOrb({ mood = "neutral", size = 220 }) {
  const color = MOOD_HEX[mood] || MOOD_HEX.neutral;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="animate-drift"
        style={{ filter: "blur(0.3px)" }}
      >
        <defs>
          <radialGradient id="orbGradient" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor={color} stopOpacity="0.95" />
            <stop offset="60%" stopColor={color} stopOpacity="0.55" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </radialGradient>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
            />
          </filter>
        </defs>
        <g filter="url(#goo)">
          <circle cx="100" cy="100" r="70" fill="url(#orbGradient)" className="animate-pulseSoft" />
          <circle cx="130" cy="80" r="30" fill="url(#orbGradient)" opacity="0.7" />
          <circle cx="75" cy="125" r="26" fill="url(#orbGradient)" opacity="0.6" />
        </g>
      </svg>
      <span className="absolute text-xs uppercase tracking-[0.2em] text-paper/70 font-mono">
        {mood}
      </span>
    </div>
  );
}
