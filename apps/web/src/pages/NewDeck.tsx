import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";
import { createDeck } from "@/lib/api";

export default function NewDeckPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const createMutation = useMutation({
    mutationFn: createDeck,
    onSuccess: (deck) => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      navigate({ to: "/decks/$id", params: { id: String(deck.id) } });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    createMutation.mutate({ name, description });
  };

  return (
    <div className="mx-auto max-w-lg animate-scale-in">
      <button
        onClick={() => navigate({ to: "/" })}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} />
        Back to decks
      </button>

      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-ink" style={{ fontFamily: "var(--font-display)" }}>
        Create New Deck
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-light">Deck Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Spanish Verbs, Biology 101"
            autoFocus
            className="h-12 w-full rounded-xl border border-[#E8E2DA] bg-paper px-4 text-ink placeholder:text-ink-muted/50 focus:border-coral/50 focus:outline-none focus:ring-2 focus:ring-coral/10"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-light">Description <span className="text-ink-muted">(optional)</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this deck"
            rows={3}
            className="w-full rounded-xl border border-[#E8E2DA] bg-paper px-4 py-3 text-ink placeholder:text-ink-muted/50 focus:border-coral/50 focus:outline-none focus:ring-2 focus:ring-coral/10"
          />
        </div>
        {error && <p className="text-sm text-rose">{error}</p>}
        {createMutation.isError && <p className="text-sm text-rose">Failed to create deck. Please try again.</p>}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-coral px-5 text-sm font-medium text-white transition-all hover:bg-coral-dark hover:shadow-lg hover:shadow-coral/20 disabled:opacity-50"
          >
            <Plus size={16} />
            {createMutation.isPending ? "Creating..." : "Create Deck"}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium text-ink-muted transition-colors hover:bg-cream-dark hover:text-ink"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
