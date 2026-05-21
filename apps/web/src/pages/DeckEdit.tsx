import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { fetchDeck, updateDeck } from "@/lib/api";

interface Deck {
  id: number;
  name: string;
  description: string | null;
}

export default function DeckEditPage() {
  const { id } = useParams({ from: "/decks/$id/edit" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: deck, isLoading } = useQuery<Deck>({
    queryKey: ["deck", id],
    queryFn: () => fetchDeck(id),
    enabled: !!id,
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useState(() => {
    if (deck) {
      setName(deck.name);
      setDescription(deck.description ?? "");
    }
  });

  const updateMutation = useMutation({
    mutationFn: () => updateDeck(id, { name, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      queryClient.invalidateQueries({ queryKey: ["deck", id] });
      navigate({ to: "/decks/$id", params: { id } });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-coral border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg animate-scale-in">
      <button
        onClick={() => navigate({ to: "/decks/$id", params: { id } })}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} />
        Back to deck
      </button>

      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-ink" style={{ fontFamily: "var(--font-display)" }}>
        Edit Deck
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-light">Deck Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="h-12 w-full rounded-xl border border-stroke bg-paper px-4 text-ink placeholder:text-ink-muted/50 focus:border-coral/50 focus:outline-none focus:ring-2 focus:ring-coral/10"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-light">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-stroke bg-paper px-4 py-3 text-ink placeholder:text-ink-muted/50 focus:border-coral/50 focus:outline-none focus:ring-2 focus:ring-coral/10"
          />
        </div>
        {updateMutation.isError && <p className="text-sm text-rose">Failed to update deck</p>}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex h-11 items-center rounded-xl bg-coral px-5 text-sm font-medium text-white transition-all hover:bg-coral-dark disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/decks/$id", params: { id } })}
            className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium text-ink-muted transition-colors hover:bg-cream-dark hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
