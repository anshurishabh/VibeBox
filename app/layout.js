import "./globals.css";
import { LanguageProvider } from "../context/LanguageContext";
import { MoodProvider } from "../context/MoodContext";
import { PlayerProvider } from "../context/PlayerContext";
import { ThemeProvider } from "../context/ThemeContext";
import { ToastProvider } from "../context/ToastContext";
import PlayerBar from "../components/PlayerBar";

export const metadata = {
  title: "VibeBox — music for your moment",
  description: "Mood and situation-aware music streaming",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink text-paper font-body">
        <ThemeProvider>
          <ToastProvider>
            <LanguageProvider>
              <MoodProvider>
                <PlayerProvider>
                  {children}
                  <PlayerBar />
                </PlayerProvider>
              </MoodProvider>
            </LanguageProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}