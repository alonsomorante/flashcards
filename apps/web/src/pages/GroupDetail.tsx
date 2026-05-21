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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="py-20 text-center">
        <p className="text-dark-muted">Group not found</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/decks/$id", params: { id: deckId } })}
          className="inline-flex items-center gap-1.5 text-sm text-dark-muted transition-colors hover:text-dark"
        >
          <ArrowLeft size={16} />
          Back to Deck
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-dark" style={{ fontFamily: "var(--font-display)" }}>
          {group.name}
        </h1>
        <p className="mt-1.5 text-sm text-dark-muted">
          {group.cards.length} {group.cards.length === 1 ? "card" : "cards"}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => navigate({ to: "/decks/$id/study", params: { id: deckId }, search: { groupId } })}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white transition-all hover:bg-primary-dark hover:shadow-[4px_4px_0px_0px_rgba(250,103,129,0.3)] hover:-translate-y-0.5"
        >
          <BookOpen size={14} />
          Study Group
        </button>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex h-11 items-center gap-2 rounded-full border-[2.5px] border-border bg-paper px-5 text-sm font-bold text-dark-light transition-all hover:bg-cream-dark hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
        >
          <Plus size={14} />
          Add Card
        </button>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-bold text-dark transition-all hover:bg-accent-dark hover:shadow-[4px_4px_0px_0px_rgba(255,201,77,0.4)] hover:-translate-y-0.5"
        >
          <Sparkles size={14} />
          Generate with AI
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-[1.25rem] border border-border bg-paper p-5 animate-scale-in">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dark-light">Front</label>
              <input
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Question or term"
                autoFocus
                className="h-11 w-full rounded-xl border border-border bg-cream px-4 text-sm text-dark placeholder:text-dark-muted/40 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dark-light">Back</label>
              <input
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Answer or definition"
                className="h-11 w-full rounded-xl border border-border bg-cream px-4 text-sm text-dark placeholder:text-dark-muted/40 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-xs font-medium text-dark-muted">Notes</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Context, references..."
              className="h-11 w-full rounded-xl border border-border bg-cream px-4 text-sm text-dark placeholder:text-dark-muted/40 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="inline-flex h-10 items-center rounded-xl bg-primary px-5 text-sm font-medium text-white transition-all hover:bg-primary-dark disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingCard ? "Update Card" : "Add Card"}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="inline-flex h-10 items-center rounded-xl px-5 text-sm font-medium text-dark-muted transition-colors hover:bg-cream-dark"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {group.cards.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-dark-muted">No cards in this group yet. Add your first card to get started.</p>
          </div>
        ) : (
          group.cards.map((card: CardData, i: number) => {
            const stickerColors = ['border-primary', 'border-accent', 'border-success'];
            const colorIndex = i % 3;
            return (
            <div
              key={card.id}
              className={`group relative rounded-[1.5rem] border-[3px] ${stickerColors[colorIndex]} bg-paper p-5 transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.06)] hover:-translate-y-1`}
            >
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-dark">{card.front}</p>
                  <p className="mt-1 text-sm text-dark-muted">{card.back}</p>
                  {card.notes ? <p className="mt-2 text-xs text-dark-muted/60 italic">{card.notes}</p> : null}
                </div>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => startEdit(card)}
                    className="rounded-lg p-2 text-dark-muted/50 transition-colors hover:bg-cream-dark hover:text-dark"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(card.id)}
                    className="rounded-lg p-2 text-dark-muted/50 transition-colors hover:bg-danger-light hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })
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
