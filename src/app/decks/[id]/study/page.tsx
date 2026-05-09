"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, RotateCcw, Zap } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";

interface Card {
  id: number;
  front: string;
  back: string;
  notes?: string | null;
  state?: string | null;
  learningStep?: number | null;
  dueMinutes?: number | null;
  interval?: number | null;
  easeFactor?: number | null;
  nextReview?: string | null;
  lastRating?: number | null;
  lastReviewed?: string | null;
}

interface DeckGroup {
  id: number;
  name: string;
  displayOrder: number;
  cards: Card[];
}

interface DeckData {
  id: number;
  name: string;
  description: string | null;
  groups: DeckGroup[];
  ungroupedCards: Card[];
}

async function fetchDeck(id: string): Promise<DeckData> {
  const res = await fetch(`/api/decks/${id}`);
  if (!res.ok) throw new Error("Failed to fetch deck");
  return res.json();
}

export default function StudyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const deckId = params.id as string;
  const groupId = searchParams.get("groupId") || undefined;
  const queryClient = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [studyQueue, setStudyQueue] = useState<Card[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  // Read from cache first — instant if coming from deck/group page
  const cachedDeck = queryClient.getQueryData<DeckData>(["deck", deckId]);

  const { data: deckData, isLoading } = useQuery({
    queryKey: ["deck", deckId],
    queryFn: () => fetchDeck(deckId),
    enabled: !!deckId,
    initialData: cachedDeck,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  // Derive cards directly from the already-loaded deck data
  const cards = groupId
    ? deckData?.groups?.find((g) => g.id === Number(groupId))?.cards ?? []
    : deckData?.groups?.flatMap((g) => g.cards) ?? [];

  const deckName = deckData?.name ?? "";

  // Initialize study queue when cards are available
  useEffect(() => {
    if (cards.length > 0 && !hasInitialized) {
      setStudyQueue(cards);
      setHasInitialized(true);
    }
  }, [cards, hasInitialized, sessionKey]);

  // Clamp currentIndex if it goes out of bounds
  useEffect(() => {
    if (currentIndex >= studyQueue.length && studyQueue.length > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, studyQueue.length]);

  const currentCard = studyQueue[currentIndex];
  const isFinished = hasInitialized && studyQueue.length === 0;
  const isReady = hasInitialized && studyQueue.length > 0;

  const handleRepeat = useCallback(() => {
    if (!currentCard || studyQueue.length <= 1) return;

    setStudyQueue((prev) => {
      const newQueue = [...prev];
      const [card] = newQueue.splice(currentIndex, 1);
      newQueue.push(card);
      return newQueue;
    });

    if (currentIndex >= studyQueue.length - 1) {
      setCurrentIndex(0);
    }

    setFlipped(false);
  }, [currentCard, currentIndex, studyQueue.length]);

  const handleHide = useCallback(() => {
    if (!currentCard) return;

    setStudyQueue((prev) => {
      const newQueue = prev.filter((_, i) => i !== currentIndex);
      return newQueue;
    });

    setFlipped(false);
  }, [currentCard, currentIndex]);

  const handleFlip = useCallback(() => {
    setFlipped((prev) => !prev);
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setFlipped(false);
    setStudyQueue([]);
    setHasInitialized(false);
    setSessionKey((k) => k + 1);
  }, []);

  if (isLoading && !cachedDeck) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <LinkButton href={`/decks/${deckId}`} variant="ghost" size="sm">
            <ArrowLeft size={16} />
            Back
          </LinkButton>
        </div>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
            <Zap size={28} className="text-zinc-300 dark:text-zinc-600" />
          </div>
          <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
            All caught up
          </p>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
            No cards in this group
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" size="sm" onClick={handleRestart}>
              <RotateCcw size={14} />
              Study Again
            </Button>
            <LinkButton
              href={`/decks/${deckId}`}
              variant="ghost"
              size="sm"
            >
              Back to Deck
            </LinkButton>
          </div>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-xl font-semibold tracking-tight">Done</p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          You reviewed {cards.length} {cards.length === 1 ? "card" : "cards"}
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={handleRestart}>
            <RotateCcw size={14} />
            Study Again
          </Button>
          <LinkButton href={`/decks/${deckId}`} variant="ghost">
            Back to Deck
          </LinkButton>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-zinc-400">Preparing cards...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <LinkButton href={`/decks/${deckId}`} variant="ghost" size="sm">
          <ArrowLeft size={16} />
          Back
        </LinkButton>
      </div>

      <div className="mb-4 text-center">
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
          {deckName} &middot; {currentIndex + 1}/{studyQueue.length}
        </p>
      </div>

      <button
        onClick={handleFlip}
        className={`mb-4 w-full rounded-2xl border p-12 text-center transition-all duration-300 hover:shadow-sm ${
          flipped
            ? "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"
            : "border-zinc-200 bg-white cursor-pointer dark:border-zinc-800 dark:bg-zinc-900"
        }`}
      >
        <p className="text-xl font-medium text-zinc-900 dark:text-zinc-100">
          {flipped ? currentCard?.back : currentCard?.front}
        </p>

        {flipped && currentCard?.notes ? (
          <div className="mx-auto mt-6 max-w-md border-t border-zinc-200 pt-4 dark:border-zinc-700">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-400 dark:text-zinc-500">
              {currentCard.notes}
            </p>
          </div>
        ) : null}

        {!flipped ? (
          <p className="mt-4 text-xs text-zinc-300 dark:text-zinc-700">
            Tap to reveal
          </p>
        ) : null}
      </button>

      {!flipped ? (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={handleFlip}>
            Show Answer
          </Button>
        </div>
      ) : null}

      {flipped && currentCard ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleRepeat}
            className="flex flex-col items-center rounded-lg bg-zinc-800 px-3 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white"
          >
            <span>Repetir</span>
            <span className="mt-1 text-xs opacity-70">
              Al final de la lista
            </span>
          </button>
          <button
            onClick={handleHide}
            className="flex flex-col items-center rounded-lg bg-zinc-200 px-3 py-3 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            <span>No mostrar</span>
            <span className="mt-1 text-xs opacity-70">
              Quitar de la sesión
            </span>
          </button>
        </div>
      ) : null}

      <div className="mt-6 text-center">
        <button
          onClick={handleRestart}
          className="text-xs text-zinc-300 hover:text-zinc-500 dark:text-zinc-700 dark:hover:text-zinc-400"
        >
          <RotateCcw size={12} className="mr-1 inline" />
          Restart
        </button>
      </div>

      <div className="mt-8 flex justify-center gap-1.5">
        {studyQueue.map((_card: Card, i: number) => (
          <div
            key={_card.id}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              i < currentIndex
                ? "bg-zinc-300 dark:bg-zinc-600"
                : i === currentIndex
                  ? "bg-zinc-900 dark:bg-white"
                  : "bg-zinc-100 dark:bg-zinc-800"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
