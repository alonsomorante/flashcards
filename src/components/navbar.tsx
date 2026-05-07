"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex h-14 max-w-4xl items-center px-4">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-zinc-900 no-underline dark:text-zinc-100"
        >
          Flashcards
        </Link>
      </div>
    </nav>
  );
}
