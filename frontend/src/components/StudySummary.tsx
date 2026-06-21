import type { ReviewLevel } from '../types/index';
import { LEVEL_LABELS } from '../types/index';

interface StudySummaryProps {
  sessionResults: Record<ReviewLevel, number>;
  studiedCount: number;
  total: number;
  onRestart: () => void;
  onExit: () => void;
}

export function StudySummary({
  sessionResults,
  studiedCount,
  total,
  onRestart,
  onExit,
}: StudySummaryProps) {
  const levelColors: Record<ReviewLevel, string> = {
    0: 'text-[var(--accent)] bg-[var(--accent)]/10',
    1: 'text-orange-500 bg-orange-500/10',
    2: 'text-[var(--detail-dark)] bg-[var(--detail)]/10',
    3: 'text-green-500 bg-green-500/10',
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border)] rounded-3xl shadow-xl p-10 md:p-14">
      <div className="text-center border-b border-[var(--border)] pb-6 mb-8">
        <h2 className="text-3xl md:text-4xl font-semibold mb-2">¡Sesión terminada!</h2>
        <p className="text-[var(--text-muted)]">
          Estudiaste {studiedCount} de {total} flashcards
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {([0, 1, 2, 3] as ReviewLevel[]).map((level) => (
          <div key={level} className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-5 text-center">
            <div className={`text-3xl font-bold mb-1 ${levelColors[level].split(' ')[0]}`}>
              {sessionResults[level]}
            </div>
            <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              {LEVEL_LABELS[level]}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRestart}
          className="px-8 py-2.5 rounded-full bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-dark)] transition-colors duration-300 shadow-md"
        >
          Estudiar de nuevo
        </button>
        <button
          onClick={onExit}
          className="px-8 py-2.5 rounded-full border border-[var(--border)] text-[var(--text-muted)] font-medium hover:border-[var(--detail)] hover:text-[var(--detail)] transition-colors duration-300"
        >
          Salir
        </button>
      </div>
    </div>
  );
}
