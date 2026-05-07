"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Deck {
  id: number;
  name: string;
  description: string | null;
}

export default function NewDeckPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const createDeckMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create deck");
      return res.json() as Promise<Deck>;
    },
    onMutate: async ({ name, description }) => {
      await queryClient.cancelQueries({ queryKey: ["decks"] });
      const previousDecks = queryClient.getQueryData<Deck[]>(["decks"]);
      queryClient.setQueryData<Deck[]>(["decks"], (old) => {
        if (!old) return old;
        const optimisticDeck: Deck = {
          id: Date.now(),
          name,
          description: description || null,
        };
        return [optimisticDeck, ...old];
      });
      return { previousDecks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousDecks) {
        queryClient.setQueryData(["decks"], context.previousDecks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
    onSuccess: (deck) => {
      router.push(`/decks/${deck.id}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    createDeckMutation.mutate({ name, description });
  };

  return (
    <div>
      <div className="mb-6">
        <LinkButton href="/" variant="ghost" size="sm">
          <ArrowLeft size={16} />
          Back to decks
        </LinkButton>
      </div>

      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-2xl font-bold">Create New Deck</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            label="Deck Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Spanish Verbs, Biology 101"
            autoFocus
          />

          <Textarea
            id="description"
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this deck"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}
          {createDeckMutation.isError && (
            <p className="text-sm text-red-500">Failed to create deck. Please try again.</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={createDeckMutation.isPending}>
              {createDeckMutation.isPending ? "Creating..." : "Create Deck"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
