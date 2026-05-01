"use client";

import { useState } from "react";
import { Pencil, Trash2, ChevronDown, ChevronUp, StickyNote } from "lucide-react";

interface CardItemProps {
  card: {
    id: number;
    front: string;
    back: string;
    notes?: string | null;
    repetitions?: number | null;
    nextReview?: string | null;
  };
  deckId: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function CardItem({ card, deckId, onEdit, onDelete }: CardItemProps) {
  const [showNotes, setShowNotes] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this card?")) return;

    await fetch(`/api/decks/${deckId}/cards/${card.id}`, {
      method: "DELETE",
    });

    onDelete();
  };

  const hasNotes = !!(card.notes && card.notes.trim().length > 0);
  const isDue = !card.nextReview || new Date(card.nextReview) <= new Date();

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-4 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {card.front}
          </p>
          <p className="mt-0.5 text-sm text-zinc-400 dark:text-zinc-500">
            {card.back}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {hasNotes && (
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="rounded-md p-1.5 text-zinc-300 hover:text-zinc-500 dark:text-zinc-700 dark:hover:text-zinc-400"
              title="Toggle notes"
            >
              {showNotes ? (
                <ChevronUp size={14} />
              ) : (
                <StickyNote size={14} />
              )}
            </button>
          )}
          <button
            onClick={onEdit}
            className="rounded-md p-1.5 text-zinc-300 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="rounded-md p-1.5 text-zinc-300 hover:bg-red-50 hover:text-red-500 dark:text-zinc-700 dark:hover:bg-red-950 dark:hover:text-red-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {hasNotes && showNotes && (
        <div className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <p className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-pre-wrap">
            {card.notes}
          </p>
        </div>
      )}
    </div>
  );
}
