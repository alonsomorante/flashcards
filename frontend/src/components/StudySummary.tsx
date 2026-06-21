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
  const renderBar = (count: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    return `[${'#'.repeat(filled)}${'-'.repeat(empty)}] ${Math.round(percentage)}%`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto border border-[var(--border-dim)] bg-[var(--bg-elevated)] p-6 md:p-10">
      <div className="border-b border-[var(--border-dim)] pb-4 mb-6">
        <h2 className="text-2xl md:text-4xl text-[var(--text)] mb-2">
          {'>'} sesión_finalizada
        </h2>
        <div className="text-[var(--text-dim)] text-sm">
          {studiedCount} de {total} fichas procesadas
        </div>
      </div>

      <div className="space-y-3 mb-8 font-[family-name:var(--font-display)] text-sm">
        {([0, 1, 2, 3] as ReviewLevel[]).map((level) => (
          <div key={level} className="flex items-center gap-4">
            <span className="w-24 text-[var(--text-dim)]">{LEVEL_LABELS[level]}</span>
            <span className="text-[var(--text)] flex-1">{renderBar(sessionResults[level])}</span>
            <span className="text-[var(--warning)] w-8 text-right">{sessionResults[level]}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={onRestart}
          className="text-[var(--bg)] bg-[var(--text)] px-6 py-2 hover:bg-[var(--text-dim)] transition-colors"
        >
          [ ./reiniciar ]
        </button>
        <button
          onClick={onExit}
          className="border border-[var(--border-dim)] px-6 py-2 hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors"
        >
          [ cd ~ ]
        </button>
      </div>
    </div>
  );
}
