"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, RotateCcw, ThumbsDown, ThumbsUp, Zap } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";

interface Card {
  id: number;
  front: string;
  back: string;
  notes?: string | null;
  repetitions?: number | null;
  interval?: number | null;
  nextReview?: string | null;
}

export default function StudyPage() {
  const params = useParams();
  const deckId = params.id as string;

  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [deckName, setDeckName] = useState("");
  const [studyAll, setStudyAll] = useState(false);

  const fetchCards = useCallback(
    (forceAll: boolean) => {
      setLoading(true);
      const url = `/api/study/${deckId}${forceAll ? "?all=true" : ""}`;
      fetch(url)
        .then((res) => res.json())
        .then((data: Card[]) => {
          setCards(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    },
    [deckId]
  );

  useEffect(() => {
    fetchCards(false);

    fetch(`/api/decks/${deckId}`)
      .then((res) => res.json())
      .then((data) => setDeckName(data.name))
      .catch(() => {});
  }, [deckId, fetchCards]);

  const currentCard = cards[currentIndex];

  const rateCard = useCallback(
    async (quality: number) => {
      if (!currentCard) return;

      await fetch(`/api/study/${deckId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: currentCard.id, quality }),
      });

      setFlipped(false);

      if (currentIndex + 1 < cards.length) {
        setTimeout(() => setCurrentIndex(currentIndex + 1), 150);
      } else {
        setFinished(true);
      }
    },
    [currentCard, currentIndex, cards.length, deckId]
  );

  const handleFlip = useCallback(() => {
    setFlipped(!flipped);
  }, [flipped]);

  const handleRestart = useCallback(() => {
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setFlipped(false);
    setFinished(false);
  }, []);

  const handleStudyAll = useCallback(() => {
    setStudyAll(true);
    fetchCards(true);
  }, [fetchCards]);

  if (loading) {
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
            No cards are due for review right now
          </p>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" size="sm" onClick={handleStudyAll}>
              Study anyway
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

  if (finished) {
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
          {deckName} &middot; {currentIndex + 1}/{cards.length}
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

        {flipped && currentCard?.notes && (
          <div className="mx-auto mt-6 max-w-md border-t border-zinc-200 pt-4 dark:border-zinc-700">
            <p className="text-sm leading-relaxed text-zinc-400 dark:text-zinc-500 whitespace-pre-wrap">
              {currentCard.notes}
            </p>
          </div>
        )}

        {!flipped && (
          <p className="mt-4 text-xs text-zinc-300 dark:text-zinc-700">
            Tap to reveal
          </p>
        )}
      </button>

      {!flipped && (
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={handleFlip}>
            Show Answer
          </Button>
        </div>
      )}

      {flipped && (
        <div className="flex justify-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => rateCard(2)}
          >
            <ThumbsDown size={14} />
            Hard
          </Button>
          <Button
            size="md"
            onClick={() => rateCard(3)}
          >
            <ThumbsUp size={14} />
            Good
          </Button>
          <Button
            size="md"
            onClick={() => rateCard(5)}
            className="bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Zap size={14} />
            Easy
          </Button>
        </div>
      )}

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
        {cards.map((_, i) => (
          <div
            key={i}
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
