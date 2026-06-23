import { useState } from 'react';
import type { Flashcard } from '../types/index';
import { LEVEL_LABELS } from '../types/index';
import type { ReviewLevel } from '../types/index';
import { useDeleteFlashcard, useUpdateFlashcard } from '../hooks/useFlashcards';
import { useSpellCheck } from '../hooks/useSpellCheck';

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
  const correctFront = useSpellCheck();
  const correctBack = useSpellCheck();

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

  const handleCorrectFront = async () => {
    if (!front.trim()) return;
    const corrected = await correctFront.mutateAsync(front);
    setFront(corrected);
  };

  const handleCorrectBack = async () => {
    if (!back.trim()) return;
    const corrected = await correctBack.mutateAsync(back);
    setBack(corrected);
  };

  if (isEditing) {
    return (
      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-5 space-y-4">
        <p className="text-sm font-medium text-[var(--text-muted)]">Editando flashcard {String(index).padStart(2, '0')}</p>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Frente</label>
            <button
              type="button"
              onClick={handleCorrectFront}
              disabled={correctFront.isPending || !front.trim()}
              className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-50 transition-colors"
            >
              {correctFront.isPending ? 'Corrigiendo...' : 'Corregir'}
            </button>
          </div>
          <textarea
            value={front}
            onChange={(e) => setFront(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            rows={2}
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">Reverso</label>
            <button
              type="button"
              onClick={handleCorrectBack}
              disabled={correctBack.isPending || !back.trim()}
              className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-50 transition-colors"
            >
              {correctBack.isPending ? 'Corrigiendo...' : 'Corregir'}
            </button>
          </div>
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg-elevated)] font-medium hover:bg-[var(--accent-light)] transition-colors"
          >
            Guardar
          </button>
          <button
            onClick={() => {
              setFront(flashcard.front);
              setBack(flashcard.back);
              setIsEditing(false);
            }}
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-5 hover:border-[var(--accent)]/50 transition-colors duration-200">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
          Flashcard {String(index).padStart(2, '0')}
        </span>
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)]">
          {LEVEL_LABELS[flashcard.level as ReviewLevel]}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-4">
        <div>
          <span className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">Pregunta</span>
          <p className="text-[var(--text)] font-medium">{flashcard.front}</p>
        </div>
        <div>
          <span className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">Respuesta</span>
          <p className="text-[var(--text-muted)]">{flashcard.back}</p>
        </div>
      </div>

      <div className="flex gap-4 pt-3 border-t border-[var(--border)]">
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          Editar
        </button>
        <button
          onClick={handleDelete}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
