"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DeckDetailClient } from "./deck-detail-client";

interface DeckData {
  id: number;
  name: string;
  description: string | null;
  cards: Array<{
    id: number;
    front: string;
    back: string;
    notes?: string | null;
    nextReview?: string | null;
  }>;
}

export default function DeckPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [deck, setDeck] = useState<DeckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    
    fetch(`/api/decks/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch deck");
        return res.json();
      })
      .then((data: DeckData) => {
        setDeck(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
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
