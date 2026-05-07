"use client";

import { memo, useMemo, useState } from "react";
import { Pencil, Trash2, ChevronUp, StickyNote } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface CardItemProps {
  card: {
    id: number;
    front: string;
    back: string;
    notes?: string | null;
    lastRating?: number | null;
  };
  deckId: number;
  onEdit: () => void;
  onDelete: (cardId: number) => void;
  showNotes: boolean;
  onToggleNotes: () => void;
}

function getRatingColor(rating: number | null | undefined): string {
  if (!rating) return "";
  switch (rating) {
    case 2:
      return "bg-red-500";
    case 3:
      return "bg-blue-500";
    case 5:
      return "bg-emerald-500";
    default:
      return "";
  }
}

function getRatingLabel(rating: number | null | undefined): string {
  if (!rating) return "";
  switch (rating) {
    case 2:
      return "Difícil";
    case 3:
      return "Normal";
    case 5:
      return "Fácil";
    default:
      return "";
  }
}

export const CardItem = memo(function CardItem({
  card,
  deckId,
  onEdit,
  onDelete,
  showNotes,
  onToggleNotes,
}: CardItemProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await fetch(`/api/decks/${deckId}/cards/${card.id}`, {
        method: "DELETE",
      });
      onDelete(card.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const hasNotes = useMemo(
    () => !!(card.notes && card.notes.trim().length > 0),
    [card.notes]
  );

  const ratingColor = getRatingColor(card.lastRating);
  const ratingLabel = getRatingLabel(card.lastRating);

  return (
    <div className="relative rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Rating indicator */}
      {ratingColor ? (
        <div
          className={`absolute right-0 top-0 rounded-bl-lg rounded-tr-lg ${ratingColor} px-2 py-0.5`}
          title={`Last rating: ${ratingLabel}`}
        >
          <span className="text-[9px] font-bold text-white uppercase">
            {ratingLabel}
          </span>
        </div>
      ) : null}

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
            onClick={() => setShowDeleteModal(true)}
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

      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Card"
        message={`Are you sure you want to delete this card?\n\nFront: "${card.front}"\nBack: "${card.back}"`}
        confirmText="Delete Card"
        variant="danger"
      />
    </div>
  );
});
