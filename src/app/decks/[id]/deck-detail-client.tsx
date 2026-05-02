"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Tag, X, Sparkles } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { CardForm } from "./card-form";
import { CardItem } from "./card-item";
import { GenerateCardsModal } from "./generate-cards-modal";

interface Tag {
  id: number;
  name: string;
}

interface CardData {
  id: number;
  front: string;
  back: string;
  notes?: string | null;
  nextReview?: string | null;
  tags?: Tag[];
}

interface DeckData {
  id: number;
  name: string;
  description: string | null;
  cards: CardData[];
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
  const [cards, setCards] = useState<CardData[]>(deck.cards);
  const [tags, setTags] = useState<Tag[]>([]);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editingCard, setEditingCard] = useState<{
    id: number;
    front: string;
    back: string;
    notes?: string | null;
  } | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [selectedTagFilter, setSelectedTagFilter] = useState<number | null>(null);
  const [newTagName, setNewTagName] = useState("");

  // Load tags
  useEffect(() => {
    fetch(`/api/decks/${deck.id}/tags`)
      .then((res) => res.json())
      .then((data: Tag[]) => setTags(data))
      .catch(() => {});
  }, [deck.id]);

  // Load card tags
  useEffect(() => {
    const loadCardTags = async () => {
      const cardsWithTags = await Promise.all(
        deck.cards.map(async (card) => {
          try {
            const res = await fetch(`/api/decks/${deck.id}/cards/${card.id}/tags`);
            const cardTags = await res.json();
            return { ...card, tags: cardTags.map((t: { tagId: number; tagName: string }) => ({ id: t.tagId, name: t.tagName })) };
          } catch {
            return card;
          }
        })
      );
      setCards(cardsWithTags);
    };
    
    loadCardTags();
  }, [deck.id, deck.cards.length]);

  const dueCount = useMemo(
    () =>
      cards.filter(
        (c) => !c.nextReview || new Date(c.nextReview) <= new Date()
      ).length,
    [cards]
  );

  const filteredCards = useMemo(() => {
    if (!selectedTagFilter) return cards;
    return cards.filter((card) =>
      card.tags?.some((tag) => tag.id === selectedTagFilter)
    );
  }, [cards, selectedTagFilter]);

  const handleCardCreated = useCallback((card: CardPartial) => {
    setCards((prev) => [
      { ...card, nextReview: null, tags: [] } as CardData,
      ...prev,
    ]);
    setShowCardForm(false);
  }, []);

  const handleCardsGenerated = useCallback((newCards: Array<{ id: number; front: string; back: string; notes?: string }>) => {
    setCards((prev) => [
      ...newCards.map((card) => ({ ...card, nextReview: null, tags: [] } as CardData)),
      ...prev,
    ]);
  }, []);

  const handleCardUpdated = useCallback((card: CardPartial) => {
    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, ...card } : c))
    );
    setEditingCard(null);
  }, []);

  const handleCardDeleted = useCallback((cardId: number) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
  }, []);

  const handleDeleteDeck = useCallback(async () => {
    if (!confirm("Delete this deck and all its cards?")) return;

    await fetch(`/api/decks/${deck.id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }, [deck.id, router]);

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

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const res = await fetch(`/api/decks/${deck.id}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      
      if (res.ok) {
        const newTag = await res.json();
        setTags((prev) => [...prev, newTag]);
        setNewTagName("");
      }
    } catch {
      // silently fail
    }
  };

  const handleDeleteTag = async (tagId: number) => {
    if (!confirm("Delete this tag?")) return;
    
    try {
      await fetch(`/api/decks/${deck.id}/tags/${tagId}`, {
        method: "DELETE",
      });
      
      setTags((prev) => prev.filter((t) => t.id !== tagId));
      if (selectedTagFilter === tagId) {
        setSelectedTagFilter(null);
      }
      
      // Remove tag from cards
      setCards((prev) =>
        prev.map((card) => ({
          ...card,
          tags: card.tags?.filter((t) => t.id !== tagId),
        }))
      );
    } catch {
      // silently fail
    }
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
            {cards.length} {cards.length === 1 ? "card" : "cards"}
            {cards.length > 0 ? ` · ${dueCount} due` : null}
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

      {/* Tags Section */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Tags
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="New tag..."
              className="h-7 rounded-lg border border-zinc-200 bg-white px-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateTag();
                }
              }}
            />
            <Button type="button" size="sm" variant="secondary" onClick={handleCreateTag}>
              <Tag size={12} />
            </Button>
          </div>
        </div>
        
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedTagFilter(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedTagFilter === null
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "border border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700"
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <div key={tag.id} className="group relative inline-flex items-center">
                <button
                  onClick={() => setSelectedTagFilter(tag.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedTagFilter === tag.id
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "border border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700"
                  }`}
                >
                  {tag.name}
                </button>
                <button
                  onClick={() => handleDeleteTag(tag.id)}
                  className="ml-0.5 rounded-full p-0.5 text-zinc-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100 dark:text-zinc-600"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            No tags yet. Create one to organize your cards.
          </p>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Cards {selectedTagFilter ? `· ${filteredCards.length} shown` : null}
        </h2>
        {showCardForm ? null : (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowGenerateModal(true)}
            >
              <Sparkles size={14} />
              Generate
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCardForm(true)}
            >
              + Add Card
            </Button>
          </div>
        )}
      </div>

      {editingCard ? (
        <CardForm
          deckId={deck.id}
          card={editingCard}
          onSaved={handleCardUpdated}
          onCancel={() => setEditingCard(null)}
        />
      ) : null}

      {showCardForm ? (
        <CardForm
          deckId={deck.id}
          onSaved={handleCardCreated}
          onCancel={() => setShowCardForm(false)}
        />
      ) : null}

      <div className="space-y-2">
        {filteredCards.length === 0 && !showCardForm ? (
          <div className="py-16 text-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              {selectedTagFilter
                ? "No cards with this tag."
                : "No cards yet. Add one to get started."}
            </p>
          </div>
        ) : null}

        {filteredCards.map((card) => (
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

      <GenerateCardsModal
        open={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        deckId={deck.id}
        onCardsCreated={handleCardsGenerated}
      />
    </div>
  );
}
