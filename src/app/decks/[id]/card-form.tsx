"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { VoiceInput } from "@/components/ui/voice-input";
import { GrammarCheck } from "@/components/ui/grammar-check";

interface Tag {
  id: number;
  name: string;
}

interface CardFormProps {
  deckId: number;
  card?: {
    id: number;
    front: string;
    back: string;
    notes?: string | null;
  };
  onSaved: (card: { id: number; front: string; back: string; notes?: string }) => void;
  onCancel: () => void;
}

export function CardForm({ deckId, card, onSaved, onCancel }: CardFormProps) {
  const [front, setFront] = useState(card?.front ?? "");
  const [back, setBack] = useState(card?.back ?? "");
  const [notes, setNotes] = useState(card?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Set<number>>(new Set());
  const [newTagName, setNewTagName] = useState("");

  const isEditing = !!card;

  useEffect(() => {
    fetch(`/api/decks/${deckId}/tags`)
      .then((res) => res.json())
      .then((data: Tag[]) => setTags(data))
      .catch(() => {});
  }, [deckId]);

  useEffect(() => {
    if (card?.id) {
      fetch(`/api/decks/${deckId}/cards/${card.id}/tags`)
        .then((res) => res.json())
        .then((data: { tagId: number; tagName: string }[]) => {
          setSelectedTags(new Set(data.map((t) => t.tagId)));
        })
        .catch(() => {});
    }
  }, [card?.id, deckId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!front.trim() || !back.trim()) {
      setError("Both sides are required");
      return;
    }

    setSaving(true);
    try {
      const url = isEditing
        ? `/api/decks/${deckId}/cards/${card.id}`
        : `/api/decks/${deckId}/cards`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          front: front.trim(),
          back: back.trim(),
          notes: notes.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to save card");

      const saved = await res.json();
      
      // Save tag assignments
      if (isEditing && card?.id) {
        // Remove unselected tags
        const currentTagsRes = await fetch(`/api/decks/${deckId}/cards/${card.id}/tags`);
        const currentTags = await currentTagsRes.json();
        const currentTagIds = new Set<number>(currentTags.map((t: { tagId: number }) => t.tagId));
        
        for (const tagId of currentTagIds) {
          if (!selectedTags.has(tagId)) {
            await fetch(`/api/decks/${deckId}/cards/${card.id}/tags?tagId=${tagId}`, {
              method: "DELETE",
            });
          }
        }
        
        // Add new tags
        for (const tagId of selectedTags) {
          if (!currentTagIds.has(tagId)) {
            await fetch(`/api/decks/${deckId}/cards/${card.id}/tags`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tagId }),
            });
          }
        }
      }
      
      onSaved(saved);
    } catch {
      setError("Failed to save card");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const res = await fetch(`/api/decks/${deckId}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      
      if (res.ok) {
        const newTag = await res.json();
        setTags((prev) => [...prev, newTag]);
        setSelectedTags((prev) => new Set(prev).add(newTag.id));
        setNewTagName("");
      }
    } catch {
      // silently fail
    }
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
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

      {/* Tags Section */}
      <div className="mt-4">
        <label className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
          Tags
        </label>
        
        {tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedTags.has(tag.id)
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "border border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        ) : null}
        
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag..."
            className="h-8 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateTag();
              }
            }}
          />
          <Button type="button" size="sm" variant="secondary" onClick={handleCreateTag}>
            Add
          </Button>
        </div>
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
