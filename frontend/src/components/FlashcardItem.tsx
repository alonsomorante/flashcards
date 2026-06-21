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
    if (confirm('¿ELIMINAR ESTA FICHA?')) {
      deleteFlashcard.mutate({ id: flashcard.id, chapterId });
    }
  };

  const paddedIndex = String(index).padStart(3, '0');

  if (isEditing) {
    return (
      <div className="border-2 border-[var(--border)] bg-[var(--bg-elevated)] p-4 space-y-3">
        <div className="border-b-2 border-[var(--border)] pb-2 mb-3">
          <span className="font-[family-name:var(--font-display)] text-[10px] text-[var(--text-muted)] tracking-widest">
            EDITAR FICHA #{paddedIndex}
          </span>
        </div>
        <textarea
          value={front}
          onChange={(e) => setFront(e.target.value)}
          className="w-full bg-[var(--bg)] border-2 border-[var(--border)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          rows={2}
          placeholder="FRENTE (PREGUNTA)"
        />
        <textarea
          value={back}
          onChange={(e) => setBack(e.target.value)}
          className="w-full bg-[var(--bg)] border-2 border-[var(--border)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          rows={2}
          placeholder="REVERSO (RESPUESTA)"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="font-[family-name:var(--font-display)] text-xs px-4 py-2 bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-dim)] transition-colors uppercase tracking-wide"
          >
            GUARDAR
          </button>
          <button
            onClick={() => {
              setFront(flashcard.front);
              setBack(flashcard.back);
              setIsEditing(false);
            }}
            className="font-[family-name:var(--font-display)] text-xs px-4 py-2 border-2 border-[var(--border)] hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors uppercase tracking-wide"
          >
            CANCELAR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-2 border-[var(--border)] bg-[var(--bg-elevated)] hover:bg-[var(--bg)] transition-colors">
      <div className="border-b-2 border-[var(--border)] px-3 py-1 flex justify-between items-center">
        <span className="font-[family-name:var(--font-display)] text-[10px] tracking-widest text-[var(--text-muted)]">
          FICHA #{paddedIndex}
        </span>
        <span
          className="font-[family-name:var(--font-display)] text-[10px] px-2 py-0.5 bg-[var(--accent)] text-[var(--bg)] uppercase tracking-wider"
        >
          {LEVEL_LABELS[flashcard.level as ReviewLevel]}
        </span>
      </div>

      <div className="p-5 grid md:grid-cols-2 gap-4">
        <div>
          <span className="font-[family-name:var(--font-display)] text-[10px] text-[var(--text-muted)] tracking-widest block mb-1">
            FRENTE
          </span>
          <p className="font-medium text-lg">{flashcard.front}</p>
        </div>
        <div>
          <span className="font-[family-name:var(--font-display)] text-[10px] text-[var(--text-muted)] tracking-widest block mb-1">
            REVERSO
          </span>
          <p className="text-[var(--text-muted)]">{flashcard.back}</p>
        </div>
      </div>

      <div className="border-t-2 border-[var(--border)] grid grid-cols-2">
        <button
          onClick={() => setIsEditing(true)}
          className="font-[family-name:var(--font-display)] text-[10px] py-2 text-center border-r-2 border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors uppercase tracking-wider"
        >
          Editar
        </button>
        <button
          onClick={handleDelete}
          className="font-[family-name:var(--font-display)] text-[10px] py-2 text-center hover:bg-[var(--error)] hover:text-[var(--bg)] transition-colors uppercase tracking-wider"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
