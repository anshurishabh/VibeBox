"use client";
import { useRef } from "react";
import { exportAllData, importAllData } from "../lib/localLists";
import { useToast } from "../context/ToastContext";

export default function ImportExportButtons() {
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  function handleExport() {
    const json = exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vibebox-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup downloaded");
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importAllData(reader.result);
        showToast("Backup restored");
      } catch {
        showToast("Invalid backup file");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // allow re-selecting the same file later
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleExport} className="text-xs font-body text-paper/50 hover:text-paper">
        Export Data
      </button>
      <span className="text-paper/20">|</span>
      <button onClick={handleImportClick} className="text-xs font-body text-paper/50 hover:text-paper">
        Import Data
      </button>
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
    </div>
  );
}