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
    <div className="w-full max-w-3xl mx-auto border-2 border-[var(--border)] bg-[var(--bg-elevated)] p-8 md:p-12">
      <div className="border-b-2 border-[var(--border)] pb-4 mb-8 text-center">
        <h2 className="text-3xl md:text-5xl font-bold uppercase mb-2">Sesión Terminada</h2>
        <p className="font-[family-name:var(--font-display)] text-sm text-[var(--text-muted)] tracking-widest">
          {String(studiedCount).padStart(3, '0')} / {String(total).padStart(3, '0')} FICHAS REVISADAS
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {([0, 1, 2, 3] as ReviewLevel[]).map((level) => (
          <div key={level} className="border-2 border-[var(--border)] bg-[var(--bg)] p-4 text-center">
            <div className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] text-[var(--accent)]">
              {String(sessionResults[level]).padStart(2, '0')}
            </div>
            <div className="font-[family-name:var(--font-display)] text-[10px] text-[var(--text-muted)] uppercase tracking-wider mt-2">
              {LEVEL_LABELS[level]}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRestart}
          className="font-[family-name:var(--font-display)] text-sm px-8 py-3 bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-dim)] transition-colors uppercase tracking-wide"
        >
          [ REINICIAR ]
        </button>
        <button
          onClick={onExit}
          className="font-[family-name:var(--font-display)] text-sm px-8 py-3 border-2 border-[var(--border)] hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors uppercase tracking-wide"
        >
          [ SALIR ]
        </button>
      </div>
    </div>
  );
}
