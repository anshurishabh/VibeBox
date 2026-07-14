"use client";
import { useEffect, useState } from "react";
import SectionRow from "./SectionRow";
import { getRecentlyPlayed } from "../lib/localLists";

export default function RecentlyPlayedSection() {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    function refresh() { setTracks(getRecentlyPlayed()); }
    refresh();
    window.addEventListener("recently-played:changed", refresh);
    return () => window.removeEventListener("recently-played:changed", refresh);
  }, []);

  if (tracks.length === 0) return null;
  return <SectionRow title="Recently Played" tracks={tracks} loading={false} />;
}