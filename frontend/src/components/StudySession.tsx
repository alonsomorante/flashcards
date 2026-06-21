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
    return <div className="text-center py-8 text-gray-500">Cargando flashcards...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error: {error.message}</p>
        <button onClick={onBack} className="text-indigo-600 hover:underline">
          {backLabel}
        </button>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">No hay flashcards para estudiar</p>
        <button onClick={onBack} className="text-indigo-600 hover:underline">
          {backLabel}
        </button>
      </div>
    );
  }

  if (isFinished || !currentCard) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-4">
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">
          {backLabel}
        </button>
        <h1 className="text-lg font-medium text-gray-700">{title}</h1>
        <button
          onClick={() => session.finish()}
          className="text-sm text-gray-500 hover:text-gray-700"
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
