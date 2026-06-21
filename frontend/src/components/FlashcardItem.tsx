import { useState } from 'react';
import type { Flashcard } from '../types/index';
import { LEVEL_LABELS } from '../types/index';
import type { ReviewLevel } from '../types/index';
import { useDeleteFlashcard, useUpdateFlashcard } from '../hooks/useFlashcards';

interface FlashcardItemProps {
  flashcard: Flashcard;
  chapterId: string;
  index: number;
}

export function FlashcardItem({ flashcard, chapterId, index }: FlashcardItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [front, setFront] = useState(flashcard.front);
  const [back, setBack] = useState(flashcard.back);

  const updateFlashcard = useUpdateFlashcard();
  const deleteFlashcard = useDeleteFlashcard();

  const handleSave = () => {
    if (!front.trim() || !back.trim()) return;
    updateFlashcard.mutate(
      { id: flashcard.id, front, back, chapterId },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleDelete = () => {
    if (confirm('¿Eliminar esta flashcard?')) {
      deleteFlashcard.mutate({ id: flashcard.id, chapterId });
    }
  };

  const levelColors: Record<ReviewLevel, string> = {
    0: 'bg-[var(--accent)]/10 text-[var(--accent)]',
    1: 'bg-orange-500/10 text-orange-500',
    2: 'bg-[var(--detail)]/10 text-[var(--detail-dark)]',
    3: 'bg-green-500/10 text-green-500',
  };

  if (isEditing) {
    return (
      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-6 shadow-md space-y-4">
        <p className="text-sm font-medium text-[var(--text-muted)]">Editando flashcard {String(index).padStart(2, '0')}</p>
        <div>
          <label className="block text-xs font-semibold text-[var(--detail)] uppercase tracking-wider mb-1">Frente</label>
          <textarea
            value={front}
            onChange={(e) => setFront(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--detail)] uppercase tracking-wider mb-1">Reverso</label>
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-dark)] transition-colors"
          >
            Guardar
          </button>
          <button
            onClick={() => {
              setFront(flashcard.front);
              setBack(flashcard.back);
              setIsEditing(false);
            }}
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--detail)] hover:text-[var(--detail)] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-6 shadow-md hover:shadow-lg hover:border-[var(--detail)]/50 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold text-[var(--detail)] uppercase tracking-wider">
          Flashcard {String(index).padStart(2, '0')}
        </span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelColors[flashcard.level as ReviewLevel]}`}>
          {LEVEL_LABELS[flashcard.level as ReviewLevel]}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-4">
        <div>
          <span className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Pregunta</span>
          <p className="text-[var(--text)] font-medium">{flashcard.front}</p>
        </div>
        <div>
          <span className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">Respuesta</span>
          <p className="text-[var(--text-muted)]">{flashcard.back}</p>
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-[var(--border)]">
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          Editar
        </button>
        <button
          onClick={handleDelete}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
