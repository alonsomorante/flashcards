import { useState } from 'react';
import type { Flashcard } from '../types/index';
import { LEVEL_LABELS, LEVEL_COLORS } from '../types/index';
import type { ReviewLevel } from '../types/index';
import { useDeleteFlashcard, useUpdateFlashcard } from '../hooks/useFlashcards';

interface FlashcardItemProps {
  flashcard: Flashcard;
  chapterId: string;
}

export function FlashcardItem({ flashcard, chapterId }: FlashcardItemProps) {
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
      <div className="border rounded-lg p-4 bg-white space-y-3">
        <textarea
          value={front}
          onChange={(e) => setFront(e.target.value)}
          className="w-full border rounded p-2 text-sm"
          rows={2}
          placeholder="Frente (pregunta)"
        />
        <textarea
          value={back}
          onChange={(e) => setBack(e.target.value)}
          className="w-full border rounded p-2 text-sm"
          rows={2}
          placeholder="Reverso (respuesta)"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
          >
            Guardar
          </button>
          <button
            onClick={() => {
              setFront(flashcard.front);
              setBack(flashcard.back);
              setIsEditing(false);
            }}
            className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 space-y-2">
          <div>
            <span className="text-xs text-gray-400">Frente:</span>
            <p className="text-gray-900">{flashcard.front}</p>
          </div>
          <div>
            <span className="text-xs text-gray-400">Reverso:</span>
            <p className="text-gray-700">{flashcard.back}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`text-xs px-2 py-1 rounded ${LEVEL_COLORS[flashcard.level as ReviewLevel]}`}
          >
            {LEVEL_LABELS[flashcard.level as ReviewLevel]}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
