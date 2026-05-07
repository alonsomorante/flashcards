"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Plus, Trash2, Pencil, Sparkles } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { CardForm } from "../../card-form";
import { CardItem } from "../../card-item";
import { GenerateCardsModal } from "../../generate-cards-modal";

interface CardData {
  id: number;
  front: string;
  back: string;
  notes?: string | null;
  nextReview?: string | null;
  lastRating?: number | null;
}

interface GroupData {
  id: number;
  name: string;
  deckId: number;
  cards: CardData[];
}

interface DeckGroup {
  id: number;
  name: string;
  displayOrder: number;
  cards: CardData[];
}

interface DeckData {
  id: number;
  name: string;
  description: string | null;
  groups: DeckGroup[];
  ungroupedCards: CardData[];
}

interface GroupSummary {
  id: number;
  name: string;
}

interface GroupPageData {
  group: GroupData;
  allGroups: GroupSummary[];
}

async function fetchGroup(deckId: string, groupId: string): Promise<GroupPageData> {
  const res = await fetch(`/api/decks/${deckId}`);
  if (!res.ok) throw new Error("Failed to fetch deck");
  const deck = await res.json();
  
  const group = deck.groups.find((g: GroupData) => g.id === Number(groupId));
  if (!group) throw new Error("Group not found");
  
  return {
    group: {
      ...group,
      deckId: Number(deckId),
    },
    allGroups: deck.groups.map((g: DeckGroup) => ({ id: g.id, name: g.name })),
  };
}

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const deckId = params.id as string;
  const groupId = params.groupId as string;

  const { data: pageData, isLoading } = useQuery({
    queryKey: ["group", deckId, groupId],
    queryFn: () => fetchGroup(deckId, groupId),
    enabled: !!deckId && !!groupId,
  });

  const group = pageData?.group;
  const allGroups = pageData?.allGroups ?? [];

  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<{
    id: number;
    front: string;
    back: string;
    notes?: string | null;
  } | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const deleteGroupMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/decks/${deckId}/groups/${groupId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete group");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      router.push(`/decks/${deckId}`);
    },
  });

  const handleDeleteGroup = () => {
    deleteGroupMutation.mutate();
  };

  const handleCardCreated = (card: { id: number; front: string; back: string; notes?: string }) => {
    setShowCardForm(false);
    queryClient.setQueryData<GroupData>(["group", deckId, groupId], (old) => {
      if (!old) return old;
      return { ...old, cards: [card, ...old.cards] };
    });
    queryClient.setQueryData<DeckData>(["deck", deckId], (old) => {
      if (!old) return old;
      return {
        ...old,
        groups: old.groups.map((g) =>
          g.id === Number(groupId) ? { ...g, cards: [card, ...g.cards] } : g
        ),
      };
    });
  };

  const handleCardUpdated = (card: { id: number; front: string; back: string; notes?: string }) => {
    setEditingCard(null);
    queryClient.setQueryData<GroupData>(["group", deckId, groupId], (old) => {
      if (!old) return old;
      return {
        ...old,
        cards: old.cards.map((c) => (c.id === card.id ? { ...c, ...card } : c)),
      };
    });
    queryClient.setQueryData<DeckData>(["deck", deckId], (old) => {
      if (!old) return old;
      return {
        ...old,
        groups: old.groups.map((g) =>
          g.id === Number(groupId)
            ? {
                ...g,
                cards: g.cards.map((c) => (c.id === card.id ? { ...c, ...card } : c)),
              }
            : g
        ),
      };
    });
  };

  const handleCardDeleted = (cardId: number) => {
    queryClient.setQueryData<GroupData>(["group", deckId, groupId], (old) => {
      if (!old) return old;
      return { ...old, cards: old.cards.filter((c) => c.id !== cardId) };
    });
    queryClient.setQueryData<DeckData>(["deck", deckId], (old) => {
      if (!old) return old;
      return {
        ...old,
        groups: old.groups.map((g) =>
          g.id === Number(groupId)
            ? { ...g, cards: g.cards.filter((c) => c.id !== cardId) }
            : g
        ),
      };
    });
  };

  const handleCardsGenerated = (cards: Array<{ id: number; front: string; back: string; notes?: string; groupId?: number }>) => {
    const cardsForThisGroup = cards.filter((c) => c.groupId === Number(groupId));
    if (cardsForThisGroup.length === 0) return;

    queryClient.setQueryData<GroupData>(["group", deckId, groupId], (old) => {
      if (!old) return old;
      return { ...old, cards: [...cardsForThisGroup, ...old.cards] };
    });
    queryClient.setQueryData<DeckData>(["deck", deckId], (old) => {
      if (!old) return old;
      return {
        ...old,
        groups: old.groups.map((g) =>
          g.id === Number(groupId)
            ? { ...g, cards: [...cardsForThisGroup, ...g.cards] }
            : g
        ),
      };
    });
  };

  const toggleNotes = (cardId: number) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-zinc-500">Group not found</p>
      </div>
    );
  }

  const groupDue = group.cards.filter(
    (c) => !c.nextReview || new Date(c.nextReview) <= new Date()
  ).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <LinkButton href={`/decks/${deckId}`} variant="ghost" size="sm">
          <ArrowLeft size={16} />
          Back to Deck
        </LinkButton>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteModal(true)}
          className="text-zinc-400 hover:text-red-500"
        >
          <Trash2 size={14} />
          Delete Group
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">{group.name}</h1>
        <p className="mt-1 text-xs text-zinc-400">
          {group.cards.length} {group.cards.length === 1 ? "card" : "cards"}
          {groupDue > 0 ? ` · ${groupDue} due` : null}
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        <LinkButton
          href={`/decks/${deckId}/study?groupId=${groupId}`}
          size="sm"
        >
          <BookOpen size={14} />
          Study Group
        </LinkButton>
        <Button variant="secondary" size="sm" onClick={() => setShowCardForm(true)}>
          <Plus size={14} />
          Add Card
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowGenerateModal(true)}>
          <Sparkles size={14} />
          Generate with AI
        </Button>
      </div>

      {showCardForm ? (
        <div className="mb-4">
          <CardForm
            deckId={Number(deckId)}
            groupId={Number(groupId)}
            onSaved={handleCardCreated}
            onCancel={() => setShowCardForm(false)}
          />
        </div>
      ) : null}

      {editingCard ? (
        <CardForm
          deckId={Number(deckId)}
          card={editingCard}
          onSaved={handleCardUpdated}
          onCancel={() => setEditingCard(null)}
        />
      ) : null}

      <div className="space-y-2">
        {group.cards.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-zinc-400">
              No cards in this group yet. Add your first card to get started.
            </p>
          </div>
        ) : (
          group.cards.map((card) => (
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
              onDelete={handleCardDeleted}
              deckId={Number(deckId)}
              showNotes={expandedNotes.has(card.id)}
              onToggleNotes={() => toggleNotes(card.id)}
            />
          ))
        )}
      </div>

      <GenerateCardsModal
        open={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        deckId={Number(deckId)}
        groups={allGroups}
        onCardsCreated={handleCardsGenerated}
      />

      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteGroup}
        title="Delete Group"
        message={`Are you sure you want to delete "${group.name}"? The cards in this group will become ungrouped (they won't be deleted).`}
        confirmText="Delete Group"
        variant="warning"
      />
    </div>
  );
}
