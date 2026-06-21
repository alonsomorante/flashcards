import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Flashcard, StudyCard } from '../types/index';
import { useStudySession } from '../hooks/useStudySession';
import { StudyCardView } from '../components/StudyCardView';
import { StudySummary } from '../components/StudySummary';

interface StudySessionProps {
  cards: StudyCard[] | Flashcard[] | undefined;
  isLoading: boolean;
  error: Error | null;
  backLabel: string;
  onBack: () => void;
  title: string;
}

export function StudySession({
  cards,
  isLoading,
  error,
  backLabel,
  onBack,
  title,
}: StudySessionProps) {
  const navigate = useNavigate();
  const session = useStudySession(cards ?? []);

  const currentCard = useMemo(() => {
    if (!cards) return null;
    if (session.currentIndex >= cards.length) return null;
    return cards[session.currentIndex];
  }, [cards, session.currentIndex]);

  const isFinished = session.isFinished || (cards !== undefined && session.currentIndex >= cards.length && !session.isFinished);

  if (isLoading) {
    return (
      <div className="text-center py-20 text-[var(--text-muted)]">
        Preparando cartas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-6 text-center">
        <p className="text-[var(--text)] font-medium">{error.message}</p>
        <button onClick={onBack} className="mt-4 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          {backLabel}
        </button>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--text-muted)]">
        <p className="text-base mb-1">No hay flashcards para estudiar</p>
        <button onClick={onBack} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          {backLabel}
        </button>
      </div>
    );
  }

  if (isFinished || !currentCard) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={onBack}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            {backLabel}
          </button>
        </div>
        <StudySummary
          sessionResults={session.sessionResults}
          studiedCount={session.studiedCount}
          total={cards.length}
          onRestart={() => {
            session.reset();
          }}
          onExit={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[var(--border)] pb-4">
        <button
          onClick={onBack}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          {backLabel}
        </button>
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide">
          {title}
        </h2>
        <button
          onClick={() => session.finish()}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          Terminar
        </button>
      </div>

      <StudyCardView
        card={currentCard}
        isFlipped={session.isFlipped}
        onFlip={session.flip}
        onMarkLevel={(level) => session.markLevel(currentCard, level)}
        position={{ current: session.currentIndex + 1, total: cards.length }}
      />
    </div>
  );
}
