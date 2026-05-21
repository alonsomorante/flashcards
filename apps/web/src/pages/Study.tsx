import { useState, useEffect, useCallback } from "react";
import { useParams, useSearch, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, RotateCcw, CheckCircle2, Sparkles, Brain, Zap } from "lucide-react";
import { fetchStudyCards, rateCard } from "@/lib/api";

interface Card {
  id: number;
  front: string;
  back: string;
  notes?: string | null;
  state?: string | null;
}

interface SessionStats {
  newCount: number;
  learningCount: number;
  reviewCount: number;
}

export default function StudyPage() {
  const { id: deckId } = useParams({ from: "/decks/$id/study" });
  const search = useSearch({ from: "/decks/$id/study" }) as { groupId?: string };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const groupId = search.groupId;

  const [flipped, setFlipped] = useState(false);
  const [studyQueue, setStudyQueue] = useState<Card[]>([]);
  const [sessionKey, setSessionKey] = useState(0);
  const [sessionStats, setSessionStats] = useState<SessionStats>({ newCount: 0, learningCount: 0, reviewCount: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: dueCards, isLoading, isError } = useQuery({
    queryKey: ["study", deckId, groupId, sessionKey],
    queryFn: () => fetchStudyCards(deckId, groupId),
    enabled: !!deckId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (dueCards && dueCards.length > 0) {
      setStudyQueue(dueCards);
      setSessionStats({ newCount: 0, learningCount: 0, reviewCount: 0 });
    }
  }, [dueCards, sessionKey]);

  const currentCard = studyQueue[0];
  const isFinished = studyQueue.length === 0 && dueCards !== undefined;

  const rateMutation = useMutation({
    mutationFn: ({ cardId, quality }: { cardId: number; quality: number }) =>
      rateCard(deckId, cardId, quality),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study", deckId] });
      queryClient.invalidateQueries({ queryKey: ["deck", deckId] });
    },
  });

  const handleRate = useCallback(
    async (quality: number) => {
      if (!currentCard || isSubmitting) return;
      setIsSubmitting(true);

      const state = currentCard.state ?? "new";
      setSessionStats((prev) => ({
        newCount: prev.newCount + (state === "new" ? 1 : 0),
        learningCount: prev.learningCount + (state === "learning" || state === "relearning" ? 1 : 0),
        reviewCount: prev.reviewCount + (state === "review" ? 1 : 0),
      }));

      try {
        await rateMutation.mutateAsync({ cardId: currentCard.id, quality });
      } catch {
        // ignore
      } finally {
        setIsSubmitting(false);
      }

      setStudyQueue((prev) => prev.slice(1));
      setFlipped(false);
    },
    [currentCard, isSubmitting, rateMutation]
  );

  const handleRestart = useCallback(() => {
    setFlipped(false);
    setStudyQueue([]);
    setSessionKey((k) => k + 1);
    setSessionStats({ newCount: 0, learningCount: 0, reviewCount: 0 });
  }, []);

  const handleFlip = useCallback(() => {
    setFlipped((prev) => !prev);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-coral border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <p className="text-ink-muted">Failed to load cards</p>
        <button
          onClick={handleRestart}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-coral px-5 text-sm font-medium text-white hover:bg-coral-dark"
        >
          <RotateCcw size={14} />
          Retry
        </button>
      </div>
    );
  }

  if (dueCards?.length === 0) {
    return (
      <div className="mx-auto max-w-md py-24 text-center animate-scale-in">
        <div className="mb-6 inline-flex rounded-full bg-gold-light p-5">
          <Zap size={32} className="text-gold" />
        </div>
        <h2 className="text-2xl font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>
          All caught up
        </h2>
        <p className="mt-2 text-sm text-ink-muted">No cards are due for review right now. Great job!</p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={handleRestart}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-coral px-5 text-sm font-medium text-white transition-all hover:bg-coral-dark hover:shadow-lg hover:shadow-coral/20"
          >
            <RotateCcw size={14} />
            Check Again
          </button>
          <button
            onClick={() => navigate({ to: "/decks/$id", params: { id: deckId } })}
            className="inline-flex h-10 items-center rounded-xl border border-[#E8E2DA] px-5 text-sm font-medium text-ink-light transition-colors hover:bg-cream-dark"
          >
            Back to Deck
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    const total = sessionStats.newCount + sessionStats.learningCount + sessionStats.reviewCount;
    return (
      <div className="mx-auto max-w-md py-16 text-center animate-scale-in">
        <div className="mb-6 inline-flex rounded-full bg-sage-light p-5">
          <CheckCircle2 size={32} className="text-sage" />
        </div>
        <h2 className="text-2xl font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>
          Session Complete
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          You reviewed {total} {total === 1 ? "card" : "cards"}
        </p>

        <div className="mt-8 rounded-[1.25rem] border border-[#E8E2DA] bg-paper p-6 text-left">
          <h3 className="mb-4 text-sm font-medium text-ink-light">Breakdown</h3>
          <div className="space-y-3">
            {sessionStats.newCount > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={18} className="text-gold" />
                  <span className="text-sm text-ink-light">New cards</span>
                </div>
                <span className="text-sm font-semibold text-ink">{sessionStats.newCount}</span>
              </div>
            )}
            {sessionStats.learningCount > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Brain size={18} className="text-amber" />
                  <span className="text-sm text-ink-light">Learning</span>
                </div>
                <span className="text-sm font-semibold text-ink">{sessionStats.learningCount}</span>
              </div>
            )}
            {sessionStats.reviewCount > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="text-sage" />
                  <span className="text-sm text-ink-light">Reviews</span>
                </div>
                <span className="text-sm font-semibold text-ink">{sessionStats.reviewCount}</span>
              </div>
            )}
            {total === 0 && <p className="text-sm text-ink-muted/60 italic">No cards rated in this session</p>}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={handleRestart}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-coral px-5 text-sm font-medium text-white transition-all hover:bg-coral-dark hover:shadow-lg hover:shadow-coral/20"
          >
            <RotateCcw size={14} />
            Study Again
          </button>
          <button
            onClick={() => navigate({ to: "/decks/$id", params: { id: deckId } })}
            className="inline-flex h-10 items-center rounded-xl border border-[#E8E2DA] px-5 text-sm font-medium text-ink-light transition-colors hover:bg-cream-dark"
          >
            Back to Deck
          </button>
        </div>
      </div>
    );
  }

  const progress = dueCards?.length
    ? Math.round(((dueCards.length - studyQueue.length) / dueCards.length) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up">
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/decks/$id", params: { id: deckId } })}
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#E8E2DA]">
            <div className="h-full rounded-full bg-coral transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-medium text-ink-muted">
            {dueCards!.length - studyQueue.length + 1}/{dueCards!.length}
          </span>
        </div>
      </div>

      {/* Card with 3D flip */}
      <div className="perspective-1000 mb-10">
        <div
          onClick={handleFlip}
          className={`relative mx-auto min-h-[360px] max-w-xl cursor-pointer transform-style-3d transition-transform duration-700 ${flipped ? "rotate-y-180" : ""}`}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-[1.75rem] border border-[#E8E2DA] bg-paper p-10 text-center shadow-xl shadow-black/5 backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-muted/50">Question</p>
            <p className="text-2xl font-medium leading-relaxed text-ink md:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
              {currentCard?.front}
            </p>
            <p className="mt-8 text-xs text-ink-muted/40">Tap to reveal answer</p>
          </div>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-[1.75rem] border border-[#E8E2DA] bg-cream-dark p-10 text-center shadow-xl shadow-black/5 backface-hidden rotate-y-180"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-ink-muted/50">Answer</p>
            <p className="text-2xl font-medium leading-relaxed text-ink md:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
              {currentCard?.back}
            </p>
            {currentCard?.notes ? (
              <div className="mx-auto mt-8 max-w-md border-t border-[#D4CFC8] pt-5">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-muted/70">{currentCard.notes}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {!flipped ? (
        <div className="flex justify-center">
          <button
            onClick={handleFlip}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-ink px-8 text-sm font-medium text-white transition-all hover:bg-ink-light hover:shadow-lg"
          >
            Show Answer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => handleRate(1)}
            disabled={isSubmitting}
            className="group flex flex-col items-center rounded-2xl bg-rose-light px-2 py-4 text-sm font-semibold text-rose transition-all hover:bg-rose/20 hover:scale-105 disabled:opacity-40"
          >
            <span>Again</span>
            <span className="mt-1 text-[10px] font-medium opacity-60">&lt; 1 min</span>
          </button>
          <button
            onClick={() => handleRate(2)}
            disabled={isSubmitting}
            className="group flex flex-col items-center rounded-2xl bg-gold-light px-2 py-4 text-sm font-semibold text-amber transition-all hover:bg-amber/20 hover:scale-105 disabled:opacity-40"
          >
            <span>Hard</span>
            <span className="mt-1 text-[10px] font-medium opacity-60">&lt; 6 min</span>
          </button>
          <button
            onClick={() => handleRate(3)}
            disabled={isSubmitting}
            className="group flex flex-col items-center rounded-2xl bg-sage-light px-2 py-4 text-sm font-semibold text-sage transition-all hover:bg-sage/20 hover:scale-105 disabled:opacity-40"
          >
            <span>Good</span>
            <span className="mt-1 text-[10px] font-medium opacity-60">1 day</span>
          </button>
          <button
            onClick={() => handleRate(4)}
            disabled={isSubmitting}
            className="group flex flex-col items-center rounded-2xl bg-coral/10 px-2 py-4 text-sm font-semibold text-coral transition-all hover:bg-coral/20 hover:scale-105 disabled:opacity-40"
          >
            <span>Easy</span>
            <span className="mt-1 text-[10px] font-medium opacity-60">4 days</span>
          </button>
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={handleRestart}
          disabled={isSubmitting}
          className="text-xs text-ink-muted/40 transition-colors hover:text-ink-muted"
        >
          <RotateCcw size={12} className="mr-1 inline" />
          Restart Session
        </button>
      </div>
    </div>
  );
}
