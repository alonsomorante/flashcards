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
  0: 'text-[#8b1e1e] border-[#8b1e1e] hover:bg-[#8b1e1e] hover:text-[var(--bg)]',
  1: 'text-[#b86a00] border-[#b86a00] hover:bg-[#b86a00] hover:text-[var(--bg)]',
  2: 'text-[#2d4a3e] border-[#2d4a3e] hover:bg-[#2d4a3e] hover:text-[var(--bg)]',
  3: 'text-[#1a1a1a] border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[var(--bg)]',
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
      <div className="flex justify-between items-center mb-5 font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] tracking-widest uppercase">
        <span>Carta {String(position.current).padStart(2, '0')} de {String(position.total).padStart(2, '0')}</span>
        <span>Nivel: {LEVEL_LABELS[card.level as ReviewLevel]}</span>
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
            className="absolute inset-0 backface-hidden bg-[var(--bg-elevated)] border border-[var(--border)] rounded shadow-lg p-10 md:p-16 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="absolute top-6 left-6 font-[family-name:var(--font-display)] text-[10px] text-[var(--text-muted)] tracking-widest uppercase">
              Pregunta
            </span>
            <p className="font-[family-name:var(--font-display)] text-2xl md:text-4xl font-medium leading-snug max-w-xl">
              {card.front}
            </p>
            <span className="absolute bottom-6 font-[family-name:var(--font-display)] text-xs text-[var(--accent)] italic">
              Click para voltear →
            </span>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 backface-hidden bg-[var(--bg-elevated)] border border-[var(--border)] rounded shadow-lg p-10 md:p-16 flex flex-col items-center justify-center text-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <span className="absolute top-6 left-6 font-[family-name:var(--font-display)] text-[10px] text-[var(--text-muted)] tracking-widest uppercase">
              Respuesta
            </span>
            <p className="font-[family-name:var(--font-body)] text-xl md:text-2xl italic leading-relaxed max-w-xl">
              {card.back}
            </p>
            <span className="absolute bottom-6 font-[family-name:var(--font-display)] text-xs text-[var(--accent)] italic">
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
                'py-3 border rounded font-[family-name:var(--font-display)] text-xs uppercase tracking-wider transition-all duration-300 hover:shadow-md',
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
