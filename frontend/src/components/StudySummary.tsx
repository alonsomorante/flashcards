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
  return (
    <div className="w-full max-w-3xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-8 md:p-12">
      <div className="border-b border-[var(--border)] pb-5 mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold mb-1">Sesión terminada</h2>
        <p className="text-[var(--text-muted)]">
          Estudiaste {studiedCount} de {total} flashcards
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {([0, 1, 2, 3] as ReviewLevel[]).map((level) => (
          <div key={level} className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-4 text-center">
            <div className="text-2xl font-semibold mb-1 text-[var(--text)]">
              {sessionResults[level]}
            </div>
            <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
              {LEVEL_LABELS[level]}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRestart}
          className="px-6 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg-elevated)] font-medium hover:bg-[var(--accent-light)] transition-colors duration-200"
        >
          Estudiar de nuevo
        </button>
        <button
          onClick={onExit}
          className="px-6 py-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] font-medium hover:border-[var(--accent)] hover:text-[var(--text)] transition-colors duration-200"
        >
          Salir
        </button>
      </div>
    </div>
  );
}
