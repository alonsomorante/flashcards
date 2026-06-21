import type { Flashcard, ReviewLevel } from '../types/index';
import { LEVEL_LABELS } from '../types/index';

interface StudyCardViewProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  onMarkLevel: (level: ReviewLevel) => void;
  position: { current: number; total: number };
}

const LEVEL_BUTTON_STYLES: Record<ReviewLevel, string> = {
  0: 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white',
  1: 'bg-orange-500/10 text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white',
  2: 'bg-[var(--detail)]/10 text-[var(--detail-dark)] border-[var(--detail)] hover:bg-[var(--detail)] hover:text-white',
  3: 'bg-green-500/10 text-green-500 border-green-500 hover:bg-green-500 hover:text-white',
};

export function StudyCardView({
  card,
  isFlipped,
  onFlip,
  onMarkLevel,
  position,
}: StudyCardViewProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-5 text-sm text-[var(--text-muted)]">
        <span>
          Carta {position.current} de {position.total}
        </span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--detail)]/10 text-[var(--detail-dark)]">
          {LEVEL_LABELS[card.level as ReviewLevel]}
        </span>
      </div>

      <div className="relative w-full min-h-[420px] perspective-1000">
        <button
          onClick={onFlip}
          className="relative w-full h-full min-h-[420px] transition-transform duration-700 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 backface-hidden bg-[var(--bg-elevated)] border-2 border-[var(--border)] rounded-3xl shadow-xl p-10 md:p-16 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="absolute top-6 left-6 text-xs font-semibold text-[var(--detail)] uppercase tracking-wider">
              Pregunta
            </span>
            <p className="text-2xl md:text-4xl font-semibold text-[var(--text)] leading-snug max-w-xl">
              {card.front}
            </p>
            <span className="absolute bottom-6 text-sm text-[var(--text-muted)]">
              Click para voltear →
            </span>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 backface-hidden bg-[var(--bg-elevated)] border-2 border-[var(--detail)] rounded-3xl shadow-xl p-10 md:p-16 flex flex-col items-center justify-center text-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <span className="absolute top-6 left-6 text-xs font-semibold text-[var(--detail)] uppercase tracking-wider">
              Respuesta
            </span>
            <p className="text-xl md:text-2xl text-[var(--text-muted)] leading-relaxed max-w-xl">
              {card.back}
            </p>
            <span className="absolute bottom-6 text-sm text-[var(--detail)]">
              ← Click para volver
            </span>
          </div>
        </button>
      </div>

      {isFlipped && (
        <div className="grid grid-cols-2 gap-3 mt-6 sm:grid-cols-4">
          {([0, 1, 2, 3] as ReviewLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => onMarkLevel(level)}
              className={[
                'py-3 border-2 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                LEVEL_BUTTON_STYLES[level],
              ].join(' ')}
            >
              {LEVEL_LABELS[level]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
