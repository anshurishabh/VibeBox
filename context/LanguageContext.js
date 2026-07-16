"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { detectLanguageFromBrowser, detectLanguageFromText } from "../lib/languageDetect";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("any");

  useEffect(() => {
    setLanguage(detectLanguageFromBrowser());
  }, []);

  function setLanguageManual(id) {
    setLanguage(id);
  }

  function setLanguageFromText(text) {
    const detected = detectLanguageFromText(text);
    if (detected) setLanguage(detected);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguageManual, setLanguageFromText }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}