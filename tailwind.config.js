/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        paper: "var(--color-paper)",
        mist: "#8A8B93",
        moods: {
          calm: "#8C9EFF",
          happy: "#4ECDC4",
          energetic: "#FF6B4A",
          sad: "#5B5F97",
          stressed: "#C94B4B",
          romantic: "#E88AAE",
          neutral: "#8A8B93",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(6px,-8px) scale(1.03)" },
          "66%": { transform: "translate(-6px,6px) scale(0.98)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.9" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        drift: "drift 9s ease-in-out infinite",
        pulseSoft: "pulseSoft 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
