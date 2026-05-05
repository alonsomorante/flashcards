"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { VoiceInput } from "@/components/ui/voice-input";
import { GrammarCheck } from "@/components/ui/grammar-check";

interface CardFormProps {
  deckId: number;
  groupId?: number;
  card?: {
    id: number;
    front: string;
    back: string;
    notes?: string | null;
  };
  onSaved: (card: { id: number; front: string; back: string; notes?: string; groupId?: number }) => void;
  onCancel: () => void;
}

export function CardForm({ deckId, groupId, card, onSaved, onCancel }: CardFormProps) {
  const [front, setFront] = useState(card?.front ?? "");
  const [back, setBack] = useState(card?.back ?? "");
  const [notes, setNotes] = useState(card?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!card;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!front.trim() || !back.trim()) {
      setError("Both sides are required");
      return;
    }

    if (!isEditing && !groupId) {
      setError("Group is required");
      return;
    }

    setSaving(true);
    try {
      const url = isEditing
        ? `/api/decks/${deckId}/cards/${card.id}`
        : `/api/decks/${deckId}/cards`;

      const method = isEditing ? "PUT" : "POST";

      const body: Record<string, unknown> = {
        front: front.trim(),
        back: back.trim(),
        notes: notes.trim(),
      };

      if (!isEditing && groupId) {
        body.groupId = groupId;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save card");

      const saved = await res.json();
      onSaved({ ...saved, groupId });
    } catch {
      setError("Failed to save card");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="front"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Front
            </label>
            <div className="flex items-center gap-0.5">
              <GrammarCheck text={front} onCorrected={setFront} />
              <VoiceInput onTranscript={setFront} currentValue={front} />
            </div>
          </div>
          <input
            id="front"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="Question or term"
            autoFocus
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="back"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Back
            </label>
            <div className="flex items-center gap-0.5">
              <GrammarCheck text={back} onCorrected={setBack} />
              <VoiceInput onTranscript={setBack} currentValue={back} />
            </div>
          </div>
          <input
            id="back"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="Answer or definition"
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="notes"
            className="text-sm font-medium text-zinc-400 dark:text-zinc-500"
          >
            Notes
          </label>
          <div className="flex items-center gap-0.5">
            <GrammarCheck text={notes} onCorrected={setNotes} />
            <VoiceInput onTranscript={setNotes} currentValue={notes} />
          </div>
        </div>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Context, references, page numbers..."
          rows={2}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 placeholder:text-zinc-300 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:placeholder:text-zinc-700 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      <div className="mt-4 flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "Saving..." : isEditing ? "Update Card" : "Add Card"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
