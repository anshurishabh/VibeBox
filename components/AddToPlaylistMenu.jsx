"use client";
import { useEffect, useState } from "react";
import {
  getPlaylists, createPlaylist, addTrackToPlaylist, removeTrackFromPlaylist, isTrackInPlaylist,
} from "../lib/localLists";

export default function AddToPlaylistMenu({ track, open, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (open) setPlaylists(getPlaylists());
  }, [open]);

  if (!open) return null;

  function handleToggle(playlistId) {
    if (isTrackInPlaylist(playlistId, track.id)) {
      removeTrackFromPlaylist(playlistId, track.id);
    } else {
      addTrackToPlaylist(playlistId, track);
    }
    setPlaylists(getPlaylists());
  }

  function handleCreate() {
    if (!newName.trim()) return;
    const playlist = createPlaylist(newName);
    addTrackToPlaylist(playlist.id, track);
    setNewName("");
    setPlaylists(getPlaylists());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/70" onClick={onClose}>
      <div
        className="w-full sm:w-80 max-h-[70vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-ink border border-paper/10 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base text-paper">Add to playlist</h3>
          <button onClick={onClose} className="text-paper/50 text-xl leading-none">×</button>
        </div>

        <div className="space-y-1 mb-4">
          {playlists.length === 0 && <p className="text-sm text-paper/40 font-body">No playlists yet.</p>}
          {playlists.map((p) => {
            const checked = isTrackInPlaylist(p.id, track.id);
            return (
              <button
                key={p.id}
                onClick={() => handleToggle(p.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-paper/5 text-left"
              >
                <span className="text-sm text-paper font-body">{p.name}</span>
                <span className="text-sm">{checked ? "✅" : "➕"}</span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 border-t border-paper/10 pt-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New playlist name"
            className="flex-1 rounded-full bg-paper/5 border border-paper/20 px-3 py-1.5 text-sm text-paper placeholder:text-paper/40 focus:outline-none focus:border-paper/60"
          />
          <button onClick={handleCreate} className="px-3 py-1.5 rounded-full bg-paper text-ink text-sm font-body">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}