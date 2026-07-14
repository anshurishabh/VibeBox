"use client";
import { LANGUAGES } from "../lib/moodMapping";

export default function LanguagePicker({ selected, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm font-body text-paper/60">
      Language
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full bg-paper/10 border border-paper/20 px-3 py-1.5 text-paper text-sm focus:outline-none focus:border-paper/60"
      >
        {LANGUAGES.map((l) => (
          <option key={l.id} value={l.id} className="bg-ink text-paper">
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
