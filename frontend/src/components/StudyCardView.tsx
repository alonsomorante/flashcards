import type { Flashcard, ReviewLevel } from '../types/index';
import { LEVEL_LABELS } from '../types/index';

interface StudyCardViewProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  onMarkLevel: (level: ReviewLevel) => void;
  position: { current: number; total: number };
}

export function StudyCardView({
  card,
  isFlipped,
  onFlip,
  onMarkLevel,
  position,
}: StudyCardViewProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4 text-sm text-[var(--text-muted)]">
        <span>
          Carta {position.current} de {position.total}
        </span>
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)]">
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
            className="absolute inset-0 backface-hidden bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-10 md:p-16 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="absolute top-6 left-6 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
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
            className="absolute inset-0 backface-hidden bg-[var(--bg-elevated)] border border-[var(--accent)] rounded-lg p-10 md:p-16 flex flex-col items-center justify-center text-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <span className="absolute top-6 left-6 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              Respuesta
            </span>
            <p className="text-xl md:text-2xl text-[var(--text-muted)] leading-relaxed max-w-xl">
              {card.back}
            </p>
            <span className="absolute bottom-6 text-sm text-[var(--text-muted)]">
              ← Click para volver
            </span>
          </div>
        </button>
      </div>

      {isFlipped && (
        <div className="grid grid-cols-2 gap-3 mt-5 sm:grid-cols-4">
          {([0, 1, 2, 3] as ReviewLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => onMarkLevel(level)}
              className="py-3 border border-[var(--border)] rounded-lg font-medium text-sm text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-colors duration-200"
            >
              {LEVEL_LABELS[level]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
