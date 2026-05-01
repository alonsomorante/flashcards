"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface GrammarCheckProps {
  text: string;
  onCorrected: (corrected: string) => void;
}

export function GrammarCheck({ text, onCorrected }: GrammarCheckProps) {
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    if (!text.trim() || checking) return;

    setChecking(true);
    try {
      const res = await fetch("/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("Correction failed");

      const data = await res.json();
      if (data.corrected && data.corrected !== text) {
        onCorrected(data.corrected);
      }
    } catch {
      // silently fail, keep original text
    } finally {
      setChecking(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheck}
      disabled={checking || !text.trim()}
      className="rounded-md p-1 text-zinc-300 transition-colors hover:bg-zinc-100 hover:text-zinc-500 disabled:opacity-30 dark:hover:bg-zinc-800 dark:text-zinc-600 dark:hover:text-zinc-400"
      title="Correct grammar and spelling"
    >
      {checking ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Sparkles size={14} />
      )}
    </button>
  );
}
