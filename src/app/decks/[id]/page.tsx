"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DeckDetailClient } from "./deck-detail-client";

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
      <div className="flex items-center justify-center py-20">
        <Loader2 size={20} className="animate-spin text-zinc-400" />
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
