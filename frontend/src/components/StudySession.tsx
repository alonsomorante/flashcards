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
      <div className="font-[family-name:var(--font-display)] text-[var(--text-muted)] text-center py-16 animate-pulse">
        CARGANDO FICHAS...
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-[var(--error)] bg-[var(--bg-elevated)] p-6 text-center">
        <span className="font-[family-name:var(--font-display)] text-[var(--error)]">ERROR: {error.message}</span>
        <div className="mt-4">
          <button onClick={onBack} className="text-[var(--accent)] hover:underline font-[family-name:var(--font-display)] text-sm">
            {backLabel}
          </button>
        </div>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="border-2 border-dashed border-[var(--text-muted)] p-12 text-center">
        <p className="font-[family-name:var(--font-display)] text-[var(--text-muted)] text-sm mb-2">
          SIN FICHAS PARA ESTUDIAR
        </p>
        <button onClick={onBack} className="text-[var(--accent)] hover:underline font-[family-name:var(--font-display)] text-sm">
          {backLabel}
        </button>
      </div>
    );
  }

  if (isFinished || !currentCard) {
    return (
      <div>
        <div className="mb-6">
          <button
            onClick={onBack}
            className="font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
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
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b-2 border-[var(--border)] pb-4">
        <button
          onClick={onBack}
          className="font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          {backLabel}
        </button>
        <h2 className="font-[family-name:var(--font-display)] text-sm tracking-widest text-[var(--accent)]">
          {title.toUpperCase()}
        </h2>
        <button
          onClick={() => session.finish()}
          className="font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
        >
          [ TERMINAR ]
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
