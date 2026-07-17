import "./globals.css";
import { LanguageProvider } from "../context/LanguageContext";
import { MoodProvider } from "../context/MoodContext";
import { PlayerProvider } from "../context/PlayerContext";
import { ThemeProvider } from "../context/ThemeContext";
import { ToastProvider } from "../context/ToastContext";
import PlayerBar from "../components/PlayerBar";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";
import OnboardingModal from "../components/OnboardingModal";

export const metadata = {
  title: "VibeBox — music for your moment",
  description: "Mood and situation-aware music streaming",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VibeBox",
  },
};

export const viewport = {
  themeColor: "#101014",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="bg-ink text-paper font-body">
        <ThemeProvider>
          <ToastProvider>
            <LanguageProvider>
              <MoodProvider>
                <PlayerProvider>
                  {children}
                  <PlayerBar />
                  <OnboardingModal />
                </PlayerProvider>
              </MoodProvider>
            </LanguageProvider>
          </ToastProvider>
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}