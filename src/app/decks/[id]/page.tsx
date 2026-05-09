"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { DeckDetailClient } from "./deck-detail-client";
import { GroupCardSkeleton } from "@/components/ui/skeleton";

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
  ungroupedCards: Array<{
    id: number;
    front: string;
    back: string;
    notes?: string | null;
    nextReview?: string | null;
    lastRating?: number | null;
  }>;
}

async function fetchDeck(id: string): Promise<DeckData> {
  const res = await fetch(`/api/decks/${id}`);
  if (!res.ok) throw new Error("Failed to fetch deck");
  return res.json();
}

export default function DeckPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: deck, isLoading, error } = useQuery({
    queryKey: ["deck", id],
    queryFn: () => fetchDeck(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div>
        <div className="mb-6 h-6 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mb-4 h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <GroupCardSkeleton count={4} />
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Deck not found
        </p>
      </div>
    );
  }

  return <DeckDetailClient deck={deck} />;
}
