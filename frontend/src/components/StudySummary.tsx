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
    <div className="w-full max-w-3xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border)] rounded shadow-lg p-10 md:p-14">
      <div className="text-center border-b border-[var(--border)] pb-8 mb-8">
        <h2 className="text-3xl md:text-5xl font-medium mb-3 italic">Sesión terminada</h2>
        <p className="font-[family-name:var(--font-body)] text-[var(--text-muted)] italic text-lg">
          {studiedCount} de {total} cartas revisadas
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {([0, 1, 2, 3] as ReviewLevel[]).map((level) => (
          <div key={level} className="bg-[var(--bg)] border border-[var(--border)] rounded p-5 text-center">
            <div className="text-3xl md:text-4xl font-medium font-[family-name:var(--font-display)] text-[var(--accent)]">
              {sessionResults[level]}
            </div>
            <div className="font-[family-name:var(--font-display)] text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-2">
              {LEVEL_LABELS[level]}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRestart}
          className="font-[family-name:var(--font-display)] text-sm px-8 py-2 bg-[var(--accent)] text-[var(--bg)] rounded hover:bg-[var(--accent-light)] transition-colors duration-300"
        >
          Estudiar de nuevo
        </button>
        <button
          onClick={onExit}
          className="font-[family-name:var(--font-display)] text-sm px-8 py-2 border border-[var(--text)] text-[var(--text)] rounded hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300"
        >
          Salir
        </button>
      </div>
    </div>
  );
}
