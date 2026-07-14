"use client";
import { useEffect, useState } from "react";
import SectionRow from "./SectionRow";
import { getFavorites } from "../lib/localLists";

export default function FavoritesSection() {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    function refresh() { setTracks(getFavorites()); }
    refresh();
    window.addEventListener("favorites:changed", refresh);
    return () => window.removeEventListener("favorites:changed", refresh);
  }, []);

  if (tracks.length === 0) return null;
  return <SectionRow title="Favorite Songs" tracks={tracks} loading={false} />;
}