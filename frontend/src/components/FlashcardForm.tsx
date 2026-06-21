import { useState } from 'react';
import { useCreateFlashcard } from '../hooks/useFlashcards';

interface FlashcardFormProps {
  chapterId: string;
}

export function FlashcardForm({ chapterId }: FlashcardFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const createFlashcard = useCreateFlashcard();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    createFlashcard.mutate(
      { chapterId, front: front.trim(), back: back.trim() },
      {
        onSuccess: () => {
          setFront('');
          setBack('');
          setIsOpen(false);
        },
      }
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full border-2 border-dashed rounded-lg p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
      >
        + Crear flashcard
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border rounded-lg p-4 bg-white space-y-3"
    >
      <h4 className="font-medium">Nueva flashcard</h4>
      <textarea
        value={front}
        onChange={(e) => setFront(e.target.value)}
        className="w-full border rounded p-2 text-sm"
        rows={2}
        placeholder="Frente (pregunta)"
        autoFocus
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
          type="submit"
          disabled={createFlashcard.isPending}
          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {createFlashcard.isPending ? 'Creando...' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
