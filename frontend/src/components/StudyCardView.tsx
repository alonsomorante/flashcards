import type { Flashcard, ReviewLevel } from '../types/index';
import { LEVEL_LABELS, LEVEL_COLORS } from '../types/index';

interface StudyCardViewProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  onMarkLevel: (level: ReviewLevel) => void;
  position: { current: number; total: number };
}

const LEVEL_BUTTON_STYLES: Record<ReviewLevel, string> = {
  0: 'bg-red-500 hover:bg-red-600 text-white',
  1: 'bg-orange-500 hover:bg-orange-600 text-white',
  2: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  3: 'bg-green-500 hover:bg-green-600 text-white',
};

export function StudyCardView({
  card,
  isFlipped,
  onFlip,
  onMarkLevel,
  position,
}: StudyCardViewProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">
          Card {position.current} de {position.total}
        </span>
        <span
          className={`text-xs px-2 py-1 rounded ${LEVEL_COLORS[card.level as ReviewLevel]}`}
        >
          Nivel actual: {LEVEL_LABELS[card.level as ReviewLevel]}
        </span>
      </div>

      <button
        onClick={onFlip}
        className="w-full min-h-[300px] border-2 rounded-xl p-8 bg-white shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center text-center"
      >
        {!isFlipped ? (
          <>
            <span className="text-xs text-gray-400 mb-2">PREGUNTA</span>
            <p className="text-xl text-gray-900">{card.front}</p>
            <span className="mt-6 text-sm text-indigo-600">Click para voltear</span>
          </>
        ) : (
          <>
            <span className="text-xs text-gray-400 mb-2">RESPUESTA</span>
            <p className="text-xl text-gray-900">{card.back}</p>
          </>
        )}
      </button>

      {isFlipped && (
        <div className="grid grid-cols-2 gap-3 mt-6 sm:grid-cols-4">
          {([0, 1, 2, 3] as ReviewLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => onMarkLevel(level)}
              className={`py-3 rounded-lg font-medium transition-colors ${LEVEL_BUTTON_STYLES[level]}`}
            >
              {LEVEL_LABELS[level]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
