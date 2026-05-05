"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Plus, Trash2, Pencil } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { CardForm } from "../../card-form";
import { CardItem } from "../../card-item";

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

async function fetchGroup(deckId: string, groupId: string): Promise<GroupData> {
  // For now, fetch the deck and extract the group
  const res = await fetch(`/api/decks/${deckId}`);
  if (!res.ok) throw new Error("Failed to fetch deck");
  const deck = await res.json();
  
  const group = deck.groups.find((g: GroupData) => g.id === Number(groupId));
  if (!group) throw new Error("Group not found");
  
  return {
    ...group,
    deckId: Number(deckId),
  };
}

export default function GroupPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const deckId = params.id as string;
  const groupId = params.groupId as string;

  const { data: group, isLoading } = useQuery({
    queryKey: ["group", deckId, groupId],
    queryFn: () => fetchGroup(deckId, groupId),
    enabled: !!deckId && !!groupId,
  });

  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<{
    id: number;
    front: string;
    back: string;
    notes?: string | null;
  } | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    queryClient.invalidateQueries({ queryKey: ["group", deckId, groupId] });
    queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
  };

  const handleCardUpdated = (card: { id: number; front: string; back: string; notes?: string }) => {
    setEditingCard(null);
    queryClient.invalidateQueries({ queryKey: ["group", deckId, groupId] });
    queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
  };

  const handleCardDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ["group", deckId, groupId] });
    queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
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
