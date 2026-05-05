"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2, BookOpen, Plus, FolderOpen } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { CardForm } from "./card-form";
import { CardItem } from "./card-item";
import { GenerateCardsModal } from "./generate-cards-modal";

interface CardData {
  id: number;
  front: string;
  back: string;
  notes?: string | null;
  nextReview?: string | null;
  lastRating?: number | null;
}

interface Group {
  id: number;
  name: string;
  displayOrder: number;
  cards: CardData[];
}

interface DeckData {
  id: number;
  name: string;
  description: string | null;
  groups: Group[];
  ungroupedCards: CardData[];
}

interface Props {
  deck: DeckData;
}

type CardPartial = {
  id: number;
  front: string;
  back: string;
  notes?: string;
};

export function DeckDetailClient({ deck }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [showCardForm, setShowCardForm] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editingCard, setEditingCard] = useState<{
    id: number;
    front: string;
    back: string;
    notes?: string | null;
  } | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [newGroupName, setNewGroupName] = useState("");

  // Use deck.groups directly from props (managed by React Query in parent)
  const groups = deck.groups;

  const totalCards = groups.reduce((sum, g) => sum + g.cards.length, 0);
  const totalDue = groups.reduce((sum, g) => 
    sum + g.cards.filter(c => !c.nextReview || new Date(c.nextReview) <= new Date()).length, 0
  );

  // Mutations
  const createGroupMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`/api/decks/${deck.id}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create group");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck-groups", deck.id] });
      queryClient.invalidateQueries({ queryKey: ["deck", String(deck.id)] });
    },
  });

  const deleteDeckMutation = useMutation({
    mutationFn: async () => {
      await fetch(`/api/decks/${deck.id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      router.push("/");
    },
  });

  const handleCardCreated = useCallback((card: CardPartial & { groupId?: number }) => {
    setShowCardForm(false);
    setSelectedGroupId(null);
    queryClient.invalidateQueries({ queryKey: ["deck", String(deck.id)] });
  }, [deck.id, queryClient]);

  const handleCardUpdated = useCallback((card: CardPartial) => {
    setEditingCard(null);
    queryClient.invalidateQueries({ queryKey: ["deck", String(deck.id)] });
  }, [deck.id, queryClient]);

  const handleCardDeleted = useCallback((cardId: number) => {
    queryClient.invalidateQueries({ queryKey: ["deck", String(deck.id)] });
  }, [deck.id, queryClient]);

  const handleCardsGenerated = useCallback((newCards: Array<{ id: number; front: string; back: string; notes?: string; groupId?: number }>) => {
    queryClient.invalidateQueries({ queryKey: ["deck", String(deck.id)] });
  }, [deck.id, queryClient]);

  const handleDeleteDeck = useCallback(() => {
    if (!confirm("Delete this deck and all its cards?")) return;
    deleteDeckMutation.mutate();
  }, [deleteDeckMutation]);

  const toggleNotes = useCallback((cardId: number) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  }, []);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    createGroupMutation.mutate(newGroupName.trim(), {
      onSuccess: () => setNewGroupName(""),
    });
  };

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
          <h1 className="text-xl font-semibold tracking-tight">
            {deck.name}
          </h1>
          {deck.description ? (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {deck.description}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {totalCards} {totalCards === 1 ? "card" : "cards"}
            {totalDue > 0 ? ` · ${totalDue} due` : null}
            {groups.length > 0 ? ` · ${groups.length} groups` : null}
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
          <Button variant="danger" size="sm" onClick={handleDeleteDeck}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Create Group Section */}
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Chapters / Groups
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="e.g., Chapter 1: Introduction"
            className="h-9 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateGroup();
              }
            }}
          />
          <Button type="button" size="sm" onClick={handleCreateGroup}>
            <Plus size={14} />
            Add Group
          </Button>
        </div>
      </div>

      {/* Groups with Cards */}
      {groups.length === 0 ? (
        <div className="py-16 text-center">
          <FolderOpen size={32} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            No groups yet. Create a group to start adding cards.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => {
            const groupDue = group.cards.filter(
              (c) => !c.nextReview || new Date(c.nextReview) <= new Date()
            ).length;

            return (
              <div
                key={group.id}
                className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Group Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <FolderOpen size={16} className="text-zinc-400" />
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                      {group.name}
                    </h3>
                    <span className="text-xs text-zinc-400">
                      {group.cards.length} cards
                      {groupDue > 0 ? ` · ${groupDue} due` : null}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <LinkButton
                      href={`/decks/${deck.id}/study?groupId=${group.id}`}
                      size="sm"
                      variant="secondary"
                    >
                      <BookOpen size={12} />
                      Study
                    </LinkButton>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedGroupId(group.id);
                        setShowCardForm(true);
                      }}
                    >
                      <Plus size={12} />
                      Add Card
                    </Button>
                  </div>
                </div>

                {/* Group Cards */}
                <div className="p-4">
                  {group.cards.length === 0 ? (
                    <p className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
                      No cards in this group yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {group.cards.map((card) => (
                        <CardItem
                          key={card.id}
                          card={card}
                          onEdit={() =>
                            setEditingCard({
                              id: card.id,
                              front: card.front,
                              back: card.back,
                              notes: card.notes,
                            })
                          }
                          onDelete={() => handleCardDeleted(card.id)}
                          deckId={deck.id}
                          showNotes={expandedNotes.has(card.id)}
                          onToggleNotes={() => toggleNotes(card.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Card Form Modal */}
      {showCardForm && selectedGroupId ? (
        <div className="mb-4">
          <CardForm
            deckId={deck.id}
            groupId={selectedGroupId}
            onSaved={handleCardCreated}
            onCancel={() => {
              setShowCardForm(false);
              setSelectedGroupId(null);
            }}
          />
        </div>
      ) : null}

      {editingCard ? (
        <CardForm
          deckId={deck.id}
          card={editingCard}
          onSaved={handleCardUpdated}
          onCancel={() => setEditingCard(null)}
        />
      ) : null}

      <GenerateCardsModal
        open={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        deckId={deck.id}
        groups={groups}
        onCardsCreated={handleCardsGenerated}
      />
    </div>
  );
}
