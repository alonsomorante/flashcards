"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Trash2, BookOpen, FolderOpen, Plus } from "lucide-react";
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {deck.groups.map((group) => {
            const groupDue = group.cards.filter(
              (c) => !c.nextReview || new Date(c.nextReview) <= new Date()
            ).length;

            return (
              <div
                key={group.id}
                className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="mb-4 flex flex-col gap-1">
                  <Link
                    href={`/decks/${deck.id}/groups/${group.id}`}
                    className="group flex items-center gap-2 no-underline"
                  >
                    <FolderOpen size={18} className="text-zinc-400" />
                    <h3 className="font-medium text-zinc-900 group-hover:underline dark:text-zinc-100">
                      {group.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-zinc-400">
                    {group.cards.length}{" "}
                    {group.cards.length === 1 ? "card" : "cards"}
                    {groupDue > 0 ? ` · ${groupDue} due` : null}
                  </p>
                </div>

                <div className="mt-auto flex gap-2">
                  <LinkButton
                    href={`/decks/${deck.id}/study?groupId=${group.id}`}
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                  >
                    <BookOpen size={12} />
                    Study
                  </LinkButton>
                  <LinkButton
                    href={`/decks/${deck.id}/groups/${group.id}?action=add`}
                    size="sm"
                    variant="ghost"
                    className="flex-1"
                  >
                    <Plus size={12} />
                    Add
                  </LinkButton>
                </div>
              </div>
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
