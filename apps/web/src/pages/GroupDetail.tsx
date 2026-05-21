import { useState } from "react";
import { useParams, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Plus, Trash2, Pencil, Sparkles } from "lucide-react";
import { fetchDeck, createCard, updateCard, deleteCard } from "@/lib/api";
import { GenerateCardsModal } from "@/components/GenerateCardsModal";

interface CardData {
  id: number;
  front: string;
  back: string;
  notes?: string | null;
}

export default function GroupPage() {
  const { id: deckId, groupId } = useParams({ from: "/decks/$id/groups/$groupId" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: pageData, isLoading } = useQuery({
    queryKey: ["group", deckId, groupId],
    queryFn: async () => {
      const deck = await fetchDeck(deckId);
      const group = (deck as any).groups.find((g: any) => g.id === Number(groupId));
      if (!group) throw new Error("Group not found");
      return {
        group: { ...group, deckId: Number(deckId) },
        allGroups: (deck as any).groups.map((g: any) => ({ id: g.id, name: g.name })),
      };
    },
    enabled: !!deckId && !!groupId,
  });

  const group = pageData?.group;
  const [showForm, setShowForm] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [notes, setNotes] = useState("");

  const createMutation = useMutation({
    mutationFn: () => createCard(deckId, { front, back, notes, groupId: Number(groupId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", deckId, groupId] });
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      setShowForm(false);
      setFront("");
      setBack("");
      setNotes("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (cardId: number) => updateCard(deckId, cardId, { front, back, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", deckId, groupId] });
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
      setEditingCard(null);
      setFront("");
      setBack("");
      setNotes("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (cardId: number) => deleteCard(deckId, cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", deckId, groupId] });
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    if (editingCard) {
      updateMutation.mutate(editingCard.id);
    } else {
      createMutation.mutate();
    }
  };

  const startEdit = (card: CardData) => {
    setEditingCard(card);
    setFront(card.front);
    setBack(card.back);
    setNotes(card.notes ?? "");
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingCard(null);
    setFront("");
    setBack("");
    setNotes("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral border-t-transparent" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink-muted">Group not found</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/decks/$id", params: { id: deckId } })}
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} />
          Back to Deck
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-ink" style={{ fontFamily: "var(--font-display)" }}>
          {group.name}
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          {group.cards.length} {group.cards.length === 1 ? "card" : "cards"}
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => navigate({ to: "/decks/$id/study", params: { id: deckId }, search: { groupId } })}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-coral px-4 text-sm font-medium text-white transition-all hover:bg-coral-dark hover:shadow-md hover:shadow-coral/20"
        >
          <BookOpen size={14} />
          Study Group
        </button>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-stroke px-4 text-sm font-medium text-ink-light transition-colors hover:bg-cream-dark"
        >
          <Plus size={14} />
          Add Card
        </button>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-light bg-amber-light px-4 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-light"
        >
          <Sparkles size={14} />
          Generate with AI
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-[1.25rem] border border-stroke bg-paper p-5 animate-scale-in">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-light">Front</label>
              <input
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Question or term"
                autoFocus
                className="h-11 w-full rounded-xl border border-stroke bg-cream px-4 text-sm text-ink placeholder:text-ink-muted/40 focus:border-coral/50 focus:outline-none focus:ring-2 focus:ring-coral/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-light">Back</label>
              <input
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Answer or definition"
                className="h-11 w-full rounded-xl border border-stroke bg-cream px-4 text-sm text-ink placeholder:text-ink-muted/40 focus:border-coral/50 focus:outline-none focus:ring-2 focus:ring-coral/10"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-xs font-medium text-ink-muted">Notes</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Context, references..."
              className="h-11 w-full rounded-xl border border-stroke bg-cream px-4 text-sm text-ink placeholder:text-ink-muted/40 focus:border-coral/50 focus:outline-none focus:ring-2 focus:ring-coral/10"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="inline-flex h-10 items-center rounded-xl bg-coral px-5 text-sm font-medium text-white transition-all hover:bg-coral-dark disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingCard ? "Update Card" : "Add Card"}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="inline-flex h-10 items-center rounded-xl px-5 text-sm font-medium text-ink-muted transition-colors hover:bg-cream-dark"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {group.cards.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-ink-muted">No cards in this group yet. Add your first card to get started.</p>
          </div>
        ) : (
          group.cards.map((card: CardData) => (
            <div
              key={card.id}
              className="group relative rounded-[1.25rem] border border-stroke bg-paper p-5 transition-all hover:border-coral/20 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{card.front}</p>
                  <p className="mt-1 text-sm text-ink-muted">{card.back}</p>
                  {card.notes ? <p className="mt-2 text-xs text-ink-muted/60 italic">{card.notes}</p> : null}
                </div>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => startEdit(card)}
                    className="rounded-lg p-2 text-ink-muted/50 transition-colors hover:bg-cream-dark hover:text-ink"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(card.id)}
                    className="rounded-lg p-2 text-ink-muted/50 transition-colors hover:bg-rose-light hover:text-rose"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <GenerateCardsModal
        open={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        deckId={deckId}
        groups={pageData?.allGroups ?? []}
        onCardsCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["group", deckId, groupId] });
          queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
        }}
      />
    </div>
  );
}
