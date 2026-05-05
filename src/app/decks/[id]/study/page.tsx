"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, RotateCcw, Zap } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";

interface Card {
  id: number;
  front: string;
  back: string;
  notes?: string | null;
  state?: string;
  learningStep?: number;
  dueMinutes?: number | null;
  interval?: number;
  easeFactor?: number;
}

async function fetchStudyCards(deckId: string, all: boolean = false, groupId?: string): Promise<Card[]> {
  let url = `/api/study/${deckId}${all ? "?all=true" : ""}`;
  if (groupId) {
    url += all ? `&groupId=${groupId}` : `?groupId=${groupId}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch cards");
  return res.json();
}

async function fetchDeckName(deckId: string): Promise<string> {
  const res = await fetch(`/api/decks/${deckId}`);
  if (!res.ok) throw new Error("Failed to fetch deck");
  const data = await res.json();
  return data.name;
}

function getButtonLabel(quality: number): string {
  switch (quality) {
    case 1: return "Again";
    case 2: return "Hard";
    case 3: return "Good";
    case 5: return "Easy";
    default: return "";
  }
}

function getButtonColor(quality: number): string {
  switch (quality) {
    case 1: return "bg-red-600 hover:bg-red-700 text-white";
    case 2: return "bg-orange-500 hover:bg-orange-600 text-white";
    case 3: return "bg-blue-500 hover:bg-blue-600 text-white";
    case 5: return "bg-emerald-500 hover:bg-emerald-600 text-white";
    default: return "";
  }
}

function getIntervalText(card: Card, quality: number): string {
  const state = card.state ?? "new";
  
  if (state === "new") {
    switch (quality) {
      case 1: return "< 1m";
      case 2: return "< 6m";
      case 3: return "< 10m";
      case 5: return "1d";
    }
  }
  
  if (state === "learning" || state === "relearning") {
    switch (quality) {
      case 1: return "< 1m";
      case 2: return "< 6m";
      case 3: return state === "learning" && (card.learningStep ?? 0) >= 2 ? "1d" : "< 10m";
      case 5: return "1d";
    }
  }
  
  if (state === "review") {
    switch (quality) {
      case 1: return "< 1m";
      case 2: return `${Math.round((card.interval ?? 0) * 1.2)}d`;
      case 3: return `${Math.round((card.interval ?? 0) * (card.easeFactor ?? 2.5))}d`;
      case 5: return `${Math.round((card.interval ?? 0) * (card.easeFactor ?? 2.5) * 1.3)}d`;
    }
  }
  
  return "";
}

export default function StudyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const deckId = params.id as string;
  const groupId = searchParams.get("groupId") || undefined;
  const queryClient = useQueryClient();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [finished, setFinished] = useState(false);
  const [studyAll, setStudyAll] = useState(false);

  const { data: cards = [], isLoading, refetch } = useQuery({
    queryKey: ["study-cards", deckId, studyAll, groupId],
    queryFn: () => fetchStudyCards(deckId, studyAll, groupId),
  });

  const { data: deckName = "" } = useQuery({
    queryKey: ["deck-name", deckId],
    queryFn: () => fetchDeckName(deckId),
  });

  const rateCardMutation = useMutation({
    mutationFn: async ({ cardId, quality }: { cardId: number; quality: number }) => {
      await fetch(`/api/study/${deckId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, quality }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
    },
  });

  useEffect(() => {
    setFlipped(false);
  }, [currentIndex]);

  // Reset finished state when cards are refetched
  useEffect(() => {
    if (cards.length > 0 && finished) {
      setFinished(false);
      setCurrentIndex(0);
    }
  }, [cards.length, finished]);

  const currentCard = cards[currentIndex];

  const rateCard = useCallback(
    async (quality: number) => {
      if (!currentCard) return;

      rateCardMutation.mutate({ cardId: currentCard.id, quality });

      // Check if card should be reinserted (learning state with Again/Hard)
      const shouldReinsert = 
        (currentCard.state === "learning" || currentCard.state === "relearning" || currentCard.state === "new") &&
        (quality === 1 || quality === 2);

      if (shouldReinsert) {
        // Refetch to get updated cards including reinserted ones
        setTimeout(() => {
          refetch();
        }, 500);
        
        if (currentIndex + 1 < cards.length) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setFinished(true);
        }
      } else {
        if (currentIndex + 1 < cards.length) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setFinished(true);
        }
      }
    },
    [currentCard, currentIndex, cards.length, rateCardMutation, refetch]
  );

  const handleFlip = useCallback(() => {
    setFlipped((prev) => !prev);
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setFlipped(false);
    setFinished(false);
    refetch();
  }, [refetch]);

  const handleStudyAll = useCallback(() => {
    setStudyAll(true);
    setCurrentIndex(0);
    setFlipped(false);
    setFinished(false);
  }, []);

  if (isLoading) {
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
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 5].map((quality) => (
            <button
              key={quality}
              onClick={() => rateCard(quality)}
              className={`flex flex-col items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors ${getButtonColor(quality)}`}
            >
              <span>{getButtonLabel(quality)}</span>
              <span className="mt-1 text-xs opacity-70">
                {getIntervalText(currentCard, quality)}
              </span>
            </button>
          ))}
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
        {cards.map((_card: Card, i: number) => (
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
