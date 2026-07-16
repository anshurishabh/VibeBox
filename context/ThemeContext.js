"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);
const THEME_KEY = "vibebox:theme";

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("dark");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(THEME_KEY) : null;
    const initial = saved === "light" ? "light" : "dark";
    setThemeState(initial);
    document.documentElement.classList.toggle("light", initial === "light");
  }, []);

  function toggleTheme() {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("light", next === "light");
      if (typeof window !== "undefined") window.localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}