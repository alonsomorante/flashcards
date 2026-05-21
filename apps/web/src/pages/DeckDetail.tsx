import { useState } from "react";
import { useParams, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, FolderOpen, Plus, Pencil } from "lucide-react";
import { fetchDeck, createGroup } from "@/lib/api";

interface GroupData {
  id: number;
  name: string;
  displayOrder: number;
  cards: Array<{ id: number; front: string; back: string }>;
  dueCount: number;
}

interface DeckData {
  id: number;
  name: string;
  description: string | null;
  groups: GroupData[];
  totalDue: number;
}

export default function DeckDetailPage() {
  const { id } = useParams({ from: "/decks/$id" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: deck, isLoading } = useQuery<DeckData>({
    queryKey: ["deck", id],
    queryFn: () => fetchDeck(id),
    enabled: !!id,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const createGroupMutation = useMutation({
    mutationFn: (name: string) => createGroup(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deck", id] });
      setNewGroupName("");
      setShowCreateModal(false);
    },
  });

  const totalCards = deck?.groups?.reduce((sum, g) => sum + g.cards.length, 0) ?? 0;

  if (isLoading) {
    return (
      <div>
        <div className="mb-6 h-8 w-48 animate-pulse rounded-xl bg-[#F5EDE4]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-[1.25rem] border border-[#E8E2DA] bg-[#F5EDE4]" />
          ))}
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="py-20 text-center">
        <p className="text-ink-muted">Deck not found</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} />
          Decks
        </button>
      </div>

      <div className="mb-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-ink" style={{ fontFamily: "var(--font-display)" }}>
            {deck.name}
          </h1>
          {deck.description ? <p className="mt-2 text-sm text-ink-muted">{deck.description}</p> : null}
          <p className="mt-2 text-xs text-ink-muted/70">
            {totalCards} {totalCards === 1 ? "card" : "cards"}
            {deck.totalDue > 0 ? (
              <span className="ml-2 inline-flex items-center rounded-full bg-coral/10 px-2.5 py-0.5 text-[10px] font-semibold text-coral-dark">
                {deck.totalDue} due
              </span>
            ) : null}
            {deck.groups.length > 0 ? ` · ${deck.groups.length} groups` : null}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            to="/decks/$id/study"
            params={{ id }}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-coral px-4 text-sm font-medium text-white transition-all hover:bg-coral-dark hover:shadow-md hover:shadow-coral/20"
          >
            <BookOpen size={14} />
            Study All
          </Link>
          <Link
            to="/decks/$id/edit"
            params={{ id }}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#E8E2DA] px-4 text-sm font-medium text-ink-light transition-colors hover:bg-cream-dark"
          >
            <Pencil size={14} />
            Edit
          </Link>
        </div>
      </div>

      {deck.groups.length === 0 ? (
        <div className="py-16 text-center">
          <FolderOpen size={32} className="mx-auto mb-3 text-ink-muted/30" />
          <p className="text-sm text-ink-muted">No groups yet. Create a group to start adding cards.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-[#E8E2DA] px-4 text-sm font-medium text-ink-light transition-colors hover:bg-cream-dark"
          >
            <Plus size={14} />
            New Group
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deck.groups.map((group) => (
            <div
              key={group.id}
              className="flex flex-col rounded-[1.25rem] border border-[#E8E2DA] bg-paper p-6 transition-all duration-300 hover:border-coral/20 hover:shadow-lg hover:shadow-coral/5 hover:-translate-y-0.5"
            >
              <div className="mb-4 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <FolderOpen size={18} className="text-ink-muted/50" />
                  <h3 className="font-medium text-ink" style={{ fontFamily: "var(--font-display)" }}>
                    {group.name}
                  </h3>
                </div>
                <p className="text-xs text-ink-muted">
                  {group.cards.length} {group.cards.length === 1 ? "card" : "cards"}
                  {group.dueCount > 0 ? (
                    <span className="ml-2 inline-flex items-center rounded-full bg-coral/10 px-2 py-0.5 text-[10px] font-semibold text-coral-dark">
                      {group.dueCount} due
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="mt-auto flex gap-2">
                <Link
                  to="/decks/$id/study"
                  params={{ id }}
                  search={{ groupId: String(group.id) }}
                  className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#E8E2DA] text-xs font-medium text-ink-light transition-colors hover:bg-cream-dark"
                >
                  <BookOpen size={12} />
                  Study
                </Link>
                <Link
                  to="/decks/$id/groups/$groupId"
                  params={{ id, groupId: String(group.id) }}
                  className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-ink text-xs font-medium text-white transition-colors hover:bg-ink-light"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[1.25rem] bg-paper p-6 shadow-2xl animate-scale-in">
            <h2 className="mb-4 text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>
              New Group
            </h2>
            <input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newGroupName.trim()) {
                  createGroupMutation.mutate(newGroupName.trim());
                }
              }}
              placeholder="e.g. Chapter 1"
              autoFocus
              className="h-12 w-full rounded-xl border border-[#E8E2DA] bg-cream px-4 text-ink placeholder:text-ink-muted/50 focus:border-coral/50 focus:outline-none focus:ring-2 focus:ring-coral/10"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium text-ink-muted transition-colors hover:bg-cream-dark"
              >
                Cancel
              </button>
              <button
                disabled={!newGroupName.trim() || createGroupMutation.isPending}
                onClick={() => createGroupMutation.mutate(newGroupName.trim())}
                className="inline-flex h-10 items-center rounded-xl bg-coral px-4 text-sm font-medium text-white transition-all hover:bg-coral-dark disabled:opacity-50"
              >
                {createGroupMutation.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
