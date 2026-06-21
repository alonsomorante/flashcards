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
  0: 'bg-[var(--bg)] text-[var(--error)] border-[var(--error)] hover:bg-[var(--error)] hover:text-[var(--bg)]',
  1: 'bg-[var(--bg)] text-[#ff8800] border-[#ff8800] hover:bg-[#ff8800] hover:text-[var(--bg)]',
  2: 'bg-[var(--bg)] text-[var(--accent)] border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg)]',
  3: 'bg-[var(--bg)] text-[var(--success)] border-[var(--success)] hover:bg-[var(--success)] hover:text-[var(--bg)]',
};

export function StudyCardView({
  card,
  isFlipped,
  onFlip,
  onMarkLevel,
  position,
}: StudyCardViewProps) {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (isFlipped) {
      setFlash(true);
      const timer = setTimeout(() => setFlash(false), 100);
      return () => clearTimeout(timer);
    }
  }, [isFlipped]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4 font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] tracking-widest">
        <span>FICHA {String(position.current).padStart(3, '0')} / {String(position.total).padStart(3, '0')}</span>
        <span>NIVEL ACTUAL: {LEVEL_LABELS[card.level as ReviewLevel].toUpperCase()}</span>
      </div>

      <button
        onClick={onFlip}
        className={[
          'w-full min-h-[360px] border-2 border-[var(--border)] bg-[var(--bg-elevated)] p-8 md:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden',
          flash ? 'bg-[var(--text)]' : '',
          'transition-none',
        ].join(' ')}
      >
        <div className="absolute top-0 left-0 right-0 border-b-2 border-[var(--border)] px-4 py-2 flex justify-between">
          <span className="font-[family-name:var(--font-display)] text-[10px] text-[var(--text-muted)] tracking-widest">
            {isFlipped ? 'REVERSO' : 'FRENTE'}
          </span>
          <span className="font-[family-name:var(--font-display)] text-[10px] text-[var(--text-muted)] tracking-widest">
            {card.id.slice(0, 8).toUpperCase()}
          </span>
        </div>

        <div className="mt-8">
          {!isFlipped ? (
            <>
              <p className="font-[family-name:var(--font-display)] text-2xl md:text-4xl font-bold uppercase leading-tight">
                {card.front}
              </p>
              <span className="mt-8 inline-block font-[family-name:var(--font-display)] text-[10px] text-[var(--text-muted)] tracking-widest border-2 border-[var(--border)] px-3 py-1">
                [ CLICK PARA VOLTEAR ]
              </span>
            </>
          ) : (
            <>
              <p className="font-[family-name:var(--font-body)] text-xl md:text-2xl leading-relaxed">
                {card.back}
              </p>
              <span className="mt-8 inline-block font-[family-name:var(--font-display)] text-[10px] text-[var(--accent)] tracking-widest border-2 border-[var(--accent)] px-3 py-1">
                [ SELECCIONA NIVEL ]
              </span>
            </>
          )}
        </div>
      </button>

      {isFlipped && (
        <div className="grid grid-cols-2 gap-2 mt-4 sm:grid-cols-4">
          {([0, 1, 2, 3] as ReviewLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => onMarkLevel(level)}
              className={[
                'py-4 border-2 font-[family-name:var(--font-display)] text-xs uppercase tracking-wider transition-colors',
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
