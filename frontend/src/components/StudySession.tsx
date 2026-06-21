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
      <div className="font-[family-name:var(--font-display)] text-[var(--text-dim)] py-20 animate-pulse">
        {'>'} cargando_fichas_en_memoria...
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-[var(--accent)] bg-[var(--bg-elevated)] p-4">
        <span className="text-[var(--accent)]">{'>'} ERROR: {error.message}</span>
        <div className="mt-3">
          <button onClick={onBack} className="text-[var(--text)] hover:text-[var(--accent)] transition-colors text-sm">
            {backLabel}
          </button>
        </div>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="text-[var(--text-muted)] py-16">
        {'>'} no hay fichas para estudiar.
        <button onClick={onBack} className="block mt-2 text-[var(--text)] hover:text-[var(--accent)] transition-colors text-sm">
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
            className="text-[var(--text-dim)] hover:text-[var(--text)] transition-colors text-sm"
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
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[var(--border-dim)] pb-3">
        <button
          onClick={onBack}
          className="text-[var(--text-dim)] hover:text-[var(--text)] transition-colors text-sm"
        >
          {backLabel}
        </button>
        <h2 className="font-[family-name:var(--font-display)] text-xs text-[var(--warning)] uppercase tracking-wider">
          {title}
        </h2>
        <button
          onClick={() => session.finish()}
          className="text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors text-sm"
        >
          [ ctrl+c ]
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
