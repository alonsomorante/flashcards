"use client";

import { memo, useMemo } from "react";
import { Pencil, Trash2, ChevronUp, StickyNote, Tag } from "lucide-react";

interface Tag {
  id: number;
  name: string;
}

interface CardItemProps {
  card: {
    id: number;
    front: string;
    back: string;
    notes?: string | null;
    tags?: Tag[];
  };
  deckId: number;
  onEdit: () => void;
  onDelete: () => void;
  showNotes: boolean;
  onToggleNotes: () => void;
}

export const CardItem = memo(function CardItem({
  card,
  deckId,
  onEdit,
  onDelete,
  showNotes,
  onToggleNotes,
}: CardItemProps) {
  const handleDelete = async () => {
    if (!confirm("Delete this card?")) return;

    await fetch(`/api/decks/${deckId}/cards/${card.id}`, {
      method: "DELETE",
    });

    onDelete();
  };

  const hasNotes = useMemo(
    () => !!(card.notes && card.notes.trim().length > 0),
    [card.notes]
  );

  const hasTags = card.tags && card.tags.length > 0;

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
          
          {hasTags ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {card.tags?.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-0.5 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  <Tag size={8} />
                  {tag.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {hasNotes ? (
            <button
              onClick={onToggleNotes}
              className="rounded-md p-1.5 text-zinc-300 hover:text-zinc-500 dark:text-zinc-700 dark:hover:text-zinc-400"
              title="Toggle notes"
            >
              {showNotes ? (
                <ChevronUp size={14} />
              ) : (
                <StickyNote size={14} />
              )}
            </button>
          ) : null}
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

      {hasNotes && showNotes ? (
        <div className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <p className="whitespace-pre-wrap text-xs text-zinc-400 dark:text-zinc-500">
            {card.notes}
          </p>
        </div>
      ) : null}
    </div>
  );
});
