"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { CardForm } from "./card-form";
import { CardItem } from "./card-item";

interface CardData {
  id: number;
  deckId: number;
  front: string;
  back: string;
  notes?: string | null;
  repetitions?: number | null;
  interval?: number | null;
  easeFactor?: number | null;
  nextReview?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  deck: {
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    cards: CardData[];
  };
}

type CardPartial = {
  id: number;
  front: string;
  back: string;
  notes?: string;
};

export function DeckDetailClient({ deck }: Props) {
  const router = useRouter();
  const [cards, setCards] = useState(deck.cards);
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<{
    id: number;
    front: string;
    back: string;
    notes?: string | null;
  } | null>(null);

  const handleCardCreated = useCallback((card: CardPartial) => {
    setCards((prev) => [card as CardData, ...prev]);
    setShowCardForm(false);
  }, []);

  const handleCardUpdated = useCallback((card: CardPartial) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === card.id ? { ...c, ...card } : c
      )
    );
    setEditingCard(null);
  }, []);

  const handleCardDeleted = useCallback(
    (cardId: number) => {
      setCards((prev) => prev.filter((c) => c.id !== cardId));
    },
    []
  );

  const handleDeleteDeck = useCallback(async () => {
    if (!confirm("Delete this deck and all its cards?")) return;

    await fetch(`/api/decks/${deck.id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }, [deck.id, router]);

  const dueCount = cards.filter(
    (c) => !c.nextReview || new Date(c.nextReview) <= new Date()
  ).length;

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
          {deck.description && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {deck.description}
            </p>
          )}
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            {cards.length} {cards.length === 1 ? "card" : "cards"}
            {cards.length > 0 && ` · ${dueCount} due`}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <LinkButton href={`/decks/${deck.id}/study`} size="sm">
            Study
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

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Cards
        </h2>
        {!showCardForm && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowCardForm(true)}
          >
            + Add Card
          </Button>
        )}
      </div>

      {editingCard && (
        <CardForm
          deckId={deck.id}
          card={editingCard}
          onSaved={handleCardUpdated}
          onCancel={() => setEditingCard(null)}
        />
      )}

      {showCardForm && (
        <CardForm
          deckId={deck.id}
          onSaved={handleCardCreated}
          onCancel={() => setShowCardForm(false)}
        />
      )}

      <div className="space-y-2">
        {cards.length === 0 && !showCardForm && (
          <div className="py-16 text-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              No cards yet. Add one to get started.
            </p>
          </div>
        )}

        {cards.map((card) => (
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
          />
        ))}
      </div>
    </div>
  );
}
