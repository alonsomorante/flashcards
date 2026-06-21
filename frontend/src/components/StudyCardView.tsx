import { useEffect, useState } from 'react';
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
  0: 'text-[var(--accent)] border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg)]',
  1: 'text-[var(--warning)] border-[var(--warning)] hover:bg-[var(--warning)] hover:text-[var(--bg)]',
  2: 'text-[var(--text-dim)] border-[var(--text-dim)] hover:bg-[var(--text-dim)] hover:text-[var(--bg)]',
  3: 'text-[var(--text)] border-[var(--text)] hover:bg-[var(--text)] hover:text-[var(--bg)]',
};

export function StudyCardView({
  card,
  isFlipped,
  onFlip,
  onMarkLevel,
  position,
}: StudyCardViewProps) {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    if (isFlipped) {
      setGlitch(true);
      const timer = setTimeout(() => setGlitch(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isFlipped]);

  const progressBar = () => {
    const filled = Math.round((position.current / position.total) * 10);
    const empty = 10 - filled;
    return `[${'#'.repeat(filled)}${'-'.repeat(empty)}] ${Math.round((position.current / position.total) * 100)}%`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-3 font-[family-name:var(--font-display)] text-xs text-[var(--text-dim)]">
        <span>{progressBar()}</span>
        <span>NIVEL: {LEVEL_LABELS[card.level as ReviewLevel].toUpperCase()}</span>
      </div>

      <button
        onClick={onFlip}
        className={[
          'w-full min-h-[360px] border border-[var(--border-dim)] bg-[var(--bg-elevated)] p-8 md:p-12 flex flex-col items-start justify-center text-left relative overflow-hidden',
          glitch ? 'animate-glitch' : '',
        ].join(' ')}
      >
        <div className="absolute top-0 left-0 right-0 border-b border-[var(--border-dim)] px-4 py-2 flex justify-between text-xs text-[var(--text-dim)]">
          <span>{isFlipped ? 'respuesta' : 'pregunta'}</span>
          <span>ID:{card.id.slice(0, 8)}</span>
        </div>

        <div className="mt-6 w-full">
          <span className="text-[var(--accent)] text-sm">{isFlipped ? '$ respuesta> ' : '$ pregunta> '}</span>
          <span className="animate-blink">_</span>

          {!isFlipped ? (
            <p className="font-[family-name:var(--font-display)] text-xl md:text-3xl text-[var(--text)] mt-4 leading-snug">
              {card.front}
            </p>
          ) : (
            <p className="font-[family-name:var(--font-display)] text-lg md:text-2xl text-[var(--text-dim)] mt-4 leading-relaxed">
              {card.back}
            </p>
          )}
        </div>

        {!isFlipped && (
          <div className="mt-auto pt-8 text-xs text-[var(--text-dim)]">
            {'>'} presione ENTER para voltear
          </div>
        )}
      </button>

      {isFlipped && (
        <div className="grid grid-cols-2 gap-2 mt-4 sm:grid-cols-4">
          {([0, 1, 2, 3] as ReviewLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => onMarkLevel(level)}
              className={[
                'py-3 border font-[family-name:var(--font-display)] text-xs uppercase tracking-wider transition-colors duration-100',
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
