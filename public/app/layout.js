import "./globals.css";

export const metadata = {
  title: "Undertone — music for your moment",
  description: "Mood and situation-aware music recommendations",
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
      <body className="bg-ink text-paper font-body">{children}</body>
    </html>
  );
}
