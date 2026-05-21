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
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg animate-scale-in">
      <button
        onClick={() => navigate({ to: "/decks/$id", params: { id } })}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-dark-muted transition-colors hover:text-dark"
      >
        <ArrowLeft size={16} />
        Back to deck
      </button>

      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-dark" style={{ fontFamily: "var(--font-display)" }}>
        Edit Deck
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-light">Deck Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="cursor-pointer h-12 w-full rounded-xl border border-border bg-paper px-4 text-dark placeholder:text-dark-muted/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-light">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="cursor-pointer w-full rounded-xl border border-border bg-paper px-4 py-3 text-dark placeholder:text-dark-muted/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>
        {updateMutation.isError && <p className="text-sm text-danger">Failed to update deck</p>}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="cursor-pointer inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-medium text-white transition-all hover:bg-primary-dark disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/decks/$id", params: { id } })}
            className="cursor-pointer inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium text-dark-muted transition-colors hover:bg-cream-dark hover:text-dark"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
