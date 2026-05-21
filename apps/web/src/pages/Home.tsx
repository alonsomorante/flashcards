import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Layers, Plus, BookOpen } from "lucide-react";

interface Deck {
  id: number;
  name: string;
  description: string | null;
}

async function fetchDecks(): Promise<Deck[]> {
  const res = await fetch("/api/decks");
  if (!res.ok) throw new Error("Failed to fetch decks");
  return res.json();
}

export default function HomePage() {
  const { data: decks = [], isLoading } = useQuery({
    queryKey: ["decks"],
    queryFn: fetchDecks,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-[1.25rem] border border-stroke bg-[#F5EDE4]" />
        ))}
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28">
        <div className="mb-6 rounded-full bg-amber-light p-5">
          <Layers size={36} className="text-amber" />
        </div>
        <p className="mb-1 text-lg font-medium text-ink-light" style={{ fontFamily: "var(--font-display)" }}>
          No decks yet
        </p>
        <p className="mb-8 text-sm text-ink-muted">Create your first deck to start studying</p>
        <Link
          to="/decks/new"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-coral px-5 text-sm font-medium text-white transition-all hover:bg-coral-dark hover:shadow-lg hover:shadow-coral/20"
        >
          <Plus size={16} />
          Create Deck
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink" style={{ fontFamily: "var(--font-display)" }}>
            Your Decks
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            {decks.length} {decks.length === 1 ? "deck" : "decks"} ready to study
          </p>
        </div>
        <Link
          to="/decks/new"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-coral px-4 text-sm font-medium text-white transition-all hover:bg-coral-dark hover:shadow-md hover:shadow-coral/20"
        >
          <Plus size={16} />
          New Deck
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck, i) => {
          const stickerColors = ['border-coral', 'border-amber', 'border-mint'];
          const shadowColors = ['hover:shadow-coral/20', 'hover:shadow-amber/20', 'hover:shadow-mint/20'];
          const colorIndex = i % 3;
          return (
            <Link
              key={deck.id}
              to="/decks/$id"
              params={{ id: String(deck.id) }}
              className={`group relative block rounded-[1.5rem] border-[3px] ${stickerColors[colorIndex]} bg-paper p-6 no-underline transition-all duration-300 ${shadowColors[colorIndex]} hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
            >
              <div className="mb-3 flex items-start justify-between">
                <h2 className="text-xl font-semibold text-ink transition-colors group-hover:text-coral" style={{ fontFamily: "var(--font-display)" }}>
                  {deck.name}
                </h2>
                <div className="rounded-full bg-amber-light p-2 text-amber-dark transition-colors group-hover:scale-110">
                  <BookOpen size={18} />
                </div>
              </div>
              {deck.description ? (
                <p className="line-clamp-2 text-sm leading-relaxed text-ink-light">{deck.description}</p>
              ) : (
                <p className="text-sm text-ink-muted/60 italic">No description</p>
              )}
              <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-mint-dark">
                <div className="h-2 w-2 rounded-full bg-mint" />
                <span>Ready to study</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
