import Link from "next/link";
import { Layers } from "lucide-react";
import { getDecks } from "@/lib/data";
import { LinkButton } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allDecks = await getDecks();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Decks</h1>
        {allDecks.length > 0 ? (
          <LinkButton href="/decks/new" size="sm" variant="secondary">
            + New
          </LinkButton>
        ) : null}
      </div>

      {allDecks.length === 0 ? (
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
          {allDecks.map((deck) => (
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
