"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2, BookOpen, FolderOpen, ChevronRight } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useState } from "react";

interface Group {
  id: number;
  name: string;
  displayOrder: number;
  cards: Array<{
    id: number;
    front: string;
    back: string;
    notes?: string | null;
    nextReview?: string | null;
    lastRating?: number | null;
  }>;
}

interface DeckData {
  id: number;
  name: string;
  description: string | null;
  groups: Group[];
}

interface Props {
  deck: DeckData;
}

export function DeckDetailClient({ deck }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const totalCards = deck.groups.reduce((sum, g) => sum + g.cards.length, 0);
  const totalDue = deck.groups.reduce(
    (sum, g) =>
      sum +
      g.cards.filter(
        (c) => !c.nextReview || new Date(c.nextReview) <= new Date()
      ).length,
    0
  );

  const deleteDeckMutation = useMutation({
    mutationFn: async () => {
      await fetch(`/api/decks/${deck.id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      router.push("/");
    },
  });

  const handleDeleteDeck = useCallback(() => {
    deleteDeckMutation.mutate();
  }, [deleteDeckMutation]);

  return (
    <div>
      <div className="mb-6">
        <LinkButton href="/" variant="ghost" size="sm">
          <ArrowLeft size={16} />
          Decks
        </LinkButton>
      </div>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">{deck.name}</h1>
          {deck.description ? (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {deck.description}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {totalCards} {totalCards === 1 ? "card" : "cards"}
            {totalDue > 0 ? ` · ${totalDue} due` : null}
            {deck.groups.length > 0 ? ` · ${deck.groups.length} groups` : null}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <LinkButton href={`/decks/${deck.id}/study`} size="sm">
            <BookOpen size={14} />
            Study All
          </LinkButton>
          <LinkButton
            href={`/decks/${deck.id}/edit`}
            variant="secondary"
            size="sm"
          >
            Edit
          </LinkButton>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {deck.groups.length === 0 ? (
        <div className="py-16 text-center">
          <FolderOpen
            size={32}
            className="mx-auto mb-3 text-zinc-300 dark:text-zinc-700"
          />
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            No groups yet. Create a group to start adding cards.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {deck.groups.map((group) => {
            const groupDue = group.cards.filter(
              (c) => !c.nextReview || new Date(c.nextReview) <= new Date()
            ).length;

            return (
              <LinkButton
                key={group.id}
                href={`/decks/${deck.id}/groups/${group.id}`}
                variant="ghost"
                className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-4 text-left no-underline transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-950"
              >
                <div className="flex items-center gap-3">
                  <FolderOpen size={20} className="text-zinc-400" />
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                      {group.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {group.cards.length}{" "}
                      {group.cards.length === 1 ? "card" : "cards"}
                      {groupDue > 0 ? ` · ${groupDue} due` : null}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-zinc-300 dark:text-zinc-600"
                />
              </LinkButton>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteDeck}
        title="Delete Deck"
        message={`Are you sure you want to delete "${deck.name}"? This will permanently delete the deck and all ${totalCards} cards inside it. This action cannot be undone.`}
        confirmText="Delete Deck"
        variant="danger"
      />
    </div>
  );
}
