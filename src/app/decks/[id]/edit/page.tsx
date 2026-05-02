"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Deck {
  id: number;
  name: string;
  description: string | null;
}

async function fetchDeck(id: string): Promise<Deck> {
  const res = await fetch(`/api/decks/${id}`);
  if (!res.ok) throw new Error("Failed to fetch deck");
  return res.json();
}

export default function EditDeckPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const { data: deck, isLoading } = useQuery({
    queryKey: ["deck", id],
    queryFn: () => fetchDeck(id),
    enabled: !!id,
  });

  const [name, setName] = useState(deck?.name ?? "");
  const [description, setDescription] = useState(deck?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Update local state when deck loads
  useState(() => {
    if (deck) {
      setName(deck.name);
      setDescription(deck.description ?? "");
    }
  });

  const updateDeckMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      const res = await fetch(`/api/decks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update deck");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      queryClient.invalidateQueries({ queryKey: ["deck", id] });
      router.push(`/decks/${id}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    updateDeckMutation.mutate({ name, description });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <LinkButton href={`/decks/${id}`} variant="ghost" size="sm">
          <ArrowLeft size={16} />
          Back to deck
        </LinkButton>
      </div>

      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-2xl font-bold">Edit Deck</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            label="Deck Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <Textarea
            id="description"
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}
          {updateDeckMutation.isError && (
            <p className="text-sm text-red-500">Failed to update deck</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={saving || updateDeckMutation.isPending}>
              {updateDeckMutation.isPending ? "Saving..." : "Save Changes"}
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
