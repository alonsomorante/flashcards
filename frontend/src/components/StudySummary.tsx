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
    <div className="w-full max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Sesión terminada</h2>
      <p className="text-gray-500 mb-6">
        Estudiaste {studiedCount} de {total} flashcards
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
        {([0, 1, 2, 3] as ReviewLevel[]).map((level) => (
          <div key={level} className="border rounded-lg p-4 bg-white">
            <div className="text-3xl font-bold text-gray-900">
              {sessionResults[level]}
            </div>
            <div className="text-sm text-gray-500">{LEVEL_LABELS[level]}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={onRestart}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Estudiar de nuevo
        </button>
        <button
          onClick={onExit}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
