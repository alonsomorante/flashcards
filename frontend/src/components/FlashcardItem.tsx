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
    if (confirm('¿ELIMINAR FICHA?')) {
      deleteFlashcard.mutate({ id: flashcard.id, chapterId });
    }
  };

  const paddedIndex = String(index).padStart(3, '0');

  if (isEditing) {
    return (
      <div className="border border-[var(--border-dim)] bg-[var(--bg-elevated)] p-4 space-y-3">
        <div className="text-[var(--text-dim)] text-xs mb-2">
          {'>'} editando_ficha --id={flashcard.id.slice(0, 8)}
        </div>
        <div>
          <span className="text-[var(--accent)] text-xs">$ frente&gt; </span>
          <textarea
            value={front}
            onChange={(e) => setFront(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--border-dim)] px-3 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--text)] mt-1"
            rows={2}
          />
        </div>
        <div>
          <span className="text-[var(--accent)] text-xs">$ reverso&gt; </span>
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--border-dim)] px-3 py-2 text-[var(--text)] focus:outline-none focus:border-[var(--text)] mt-1"
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="text-[var(--bg)] bg-[var(--text)] px-3 py-1 text-xs hover:bg-[var(--text-dim)] transition-colors"
          >
            [guardar]
          </button>
          <button
            onClick={() => {
              setFront(flashcard.front);
              setBack(flashcard.back);
              setIsEditing(false);
            }}
            className="border border-[var(--border-dim)] px-3 py-1 text-xs hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors"
          >
            [cancelar]
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[var(--border-dim)] bg-[var(--bg-elevated)] p-4 hover:border-[var(--text-dim)] transition-colors">
      <div className="flex justify-between items-start mb-3 text-xs text-[var(--text-dim)]">
        <span>FICHA {paddedIndex}</span>
        <span className="text-[var(--warning)]">[{LEVEL_LABELS[flashcard.level as ReviewLevel].toUpperCase()}]</span>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-3">
        <div>
          <span className="text-[var(--accent)] text-xs">$ pregunta&gt; </span>
          <p className="text-[var(--text)] mt-1">{flashcard.front}</p>
        </div>
        <div>
          <span className="text-[var(--accent)] text-xs">$ respuesta&gt; </span>
          <p className="text-[var(--text-dim)] mt-1">{flashcard.back}</p>
        </div>
      </div>

      <div className="flex gap-3 border-t border-[var(--border-dim)] pt-2">
        <button
          onClick={() => setIsEditing(true)}
          className="text-[var(--text-dim)] text-xs hover:text-[var(--text)] transition-colors"
        >
          [editar]
        </button>
        <button
          onClick={handleDelete}
          className="text-[var(--text-dim)] text-xs hover:text-[var(--accent)] transition-colors"
        >
          [eliminar]
        </button>
      </div>
    </div>
  );
}
