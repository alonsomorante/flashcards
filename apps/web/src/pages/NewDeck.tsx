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
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-dark-muted transition-colors hover:text-dark"
      >
        <ArrowLeft size={16} />
        Back to decks
      </button>

      <h1 className="mb-8 text-3xl font-semibold tracking-tight text-dark" style={{ fontFamily: "var(--font-display)" }}>
        Create New Deck
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-light">Deck Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Spanish Verbs, Biology 101"
            autoFocus
            className="cursor-pointer h-12 w-full rounded-xl border border-border bg-paper px-4 text-dark placeholder:text-dark-muted/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-light">Description <span className="text-dark-muted">(optional)</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this deck"
            rows={3}
            className="cursor-pointer w-full rounded-xl border border-border bg-paper px-4 py-3 text-dark placeholder:text-dark-muted/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        {createMutation.isError && <p className="text-sm text-danger">Failed to create deck. Please try again.</p>}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="cursor-pointer inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50"
          >
            <Plus size={16} />
            {createMutation.isPending ? "Creating..." : "Create Deck"}
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="cursor-pointer inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium text-dark-muted transition-colors hover:bg-cream-dark hover:text-dark"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
