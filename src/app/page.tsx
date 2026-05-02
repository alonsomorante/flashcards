"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, Loader2 } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

interface Deck {
  id: number;
  name: string;
  description: string | null;
}

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/decks")
      .then((res) => res.json())
      .then((data: Deck[]) => {
        setDecks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={20} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Decks</h1>
        {decks.length > 0 ? (
          <LinkButton href="/decks/new" size="sm" variant="secondary">
            + New
          </LinkButton>
        ) : null}
      </div>

      {decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Layers
            size={40}
            className="mb-4 text-zinc-200 dark:text-zinc-800"
          />
          <p className="mb-1 text-base font-medium text-zinc-500 dark:text-zinc-400">
            No decks yet
          </p>
          <p className="mb-6 text-sm text-zinc-400 dark:text-zinc-500">
            Create your first deck to start studying
          </p>
          <LinkButton href="/decks/new">Create Deck</LinkButton>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Link
              key={deck.id}
              href={`/decks/${deck.id}`}
              className="group block rounded-xl border border-zinc-200 bg-white p-5 no-underline transition-all hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <h2 className="font-medium text-zinc-900 dark:text-zinc-100">
                {deck.name}
              </h2>
              {deck.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400 dark:text-zinc-500">
                  {deck.description}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
