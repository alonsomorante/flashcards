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
      <div className="font-[family-name:var(--font-display)] text-[var(--text-muted)] text-center py-20 italic animate-pulse">
        Preparando las cartas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-[var(--accent)] bg-[var(--bg-elevated)] p-8 text-center rounded">
        <span className="font-[family-name:var(--font-display)] text-[var(--accent)] italic text-lg">{error.message}</span>
        <div className="mt-4">
          <button onClick={onBack} className="text-[var(--accent)] hover:underline italic">
            {backLabel}
          </button>
        </div>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--text-muted)]">
        <p className="font-[family-name:var(--font-display)] italic text-xl mb-2">No hay cartas para estudiar</p>
        <button onClick={onBack} className="text-[var(--accent)] hover:underline italic">
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
            className="font-[family-name:var(--font-display)] text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300 italic"
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
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[var(--border)] pb-4">
        <button
          onClick={onBack}
          className="font-[family-name:var(--font-display)] text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300 italic"
        >
          {backLabel}
        </button>
        <h2 className="font-[family-name:var(--font-display)] text-sm tracking-widest text-[var(--accent)] uppercase">
          {title}
        </h2>
        <button
          onClick={() => session.finish()}
          className="font-[family-name:var(--font-display)] text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300 italic"
        >
          Terminar sesión
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
