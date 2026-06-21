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

  if (isEditing) {
    return (
      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
          <span className="font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] tracking-widest uppercase">
            Editando flashcard {String(index).padStart(2, '0')}
          </span>
        </div>
        <div>
          <label className="block font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">Frente</label>
          <textarea
            value={front}
            onChange={(e) => setFront(e.target.value)}
            className="w-full bg-transparent border border-[var(--border)] rounded p-3 text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            rows={2}
          />
        </div>
        <div>
          <label className="block font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">Reverso</label>
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            className="w-full bg-transparent border border-[var(--border)] rounded p-3 text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="font-[family-name:var(--font-display)] text-xs px-4 py-2 bg-[var(--accent)] text-[var(--bg)] rounded hover:bg-[var(--accent-light)] transition-colors duration-300"
          >
            Guardar
          </button>
          <button
            onClick={() => {
              setFront(flashcard.front);
              setBack(flashcard.back);
              setIsEditing(false);
            }}
            className="font-[family-name:var(--font-display)] text-xs px-4 py-2 border border-[var(--text)] text-[var(--text)] rounded hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4 border-b border-[var(--border)] pb-3">
        <span className="font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] tracking-widest uppercase">
          Flashcard {String(index).padStart(2, '0')}
        </span>
        <span className="font-[family-name:var(--font-display)] text-xs italic text-[var(--accent)]">
          {LEVEL_LABELS[flashcard.level as ReviewLevel]}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <span className="font-[family-name:var(--font-display)] text-[10px] text-[var(--text-muted)] uppercase tracking-widest block mb-1">
            Pregunta
          </span>
          <p className="font-[family-name:var(--font-display)] text-lg font-medium">{flashcard.front}</p>
        </div>
        <div>
          <span className="font-[family-name:var(--font-display)] text-[10px] text-[var(--text-muted)] uppercase tracking-widest block mb-1">
            Respuesta
          </span>
          <p className="font-[family-name:var(--font-body)] italic text-[var(--text-muted)]">{flashcard.back}</p>
        </div>
      </div>

      <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--border)]">
        <button
          onClick={() => setIsEditing(true)}
          className="font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300 italic"
        >
          Editar
        </button>
        <button
          onClick={handleDelete}
          className="font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300 italic"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
