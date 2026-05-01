"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-zinc-900 no-underline dark:text-zinc-100"
        >
          Flashcards
        </Link>
        <Link
          href="/decks/new"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 no-underline transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <Plus size={14} />
          New Deck
        </Link>
      </div>
    </nav>
  );
}
