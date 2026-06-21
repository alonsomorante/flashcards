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
        className="w-full border border-dashed border-[var(--border)] rounded p-5 text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all duration-300 font-[family-name:var(--font-display)] italic"
      >
        + Añadir nueva flashcard
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-6 shadow-sm space-y-4"
    >
      <div className="border-b border-[var(--border)] pb-3 mb-3">
        <span className="font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] tracking-widest uppercase">
          Nueva flashcard
        </span>
      </div>
      <div>
        <label className="block font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">Frente</label>
        <textarea
          value={front}
          onChange={(e) => setFront(e.target.value)}
          className="w-full bg-transparent border border-[var(--border)] rounded p-3 text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          rows={2}
          placeholder="Escribe la pregunta..."
          autoFocus
        />
      </div>
      <div>
        <label className="block font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">Reverso</label>
        <textarea
          value={back}
          onChange={(e) => setBack(e.target.value)}
          className="w-full bg-transparent border border-[var(--border)] rounded p-3 text-[var(--text)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          rows={2}
          placeholder="Escribe la respuesta..."
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createFlashcard.isPending}
          className="font-[family-name:var(--font-display)] text-xs px-4 py-2 bg-[var(--accent)] text-[var(--bg)] rounded hover:bg-[var(--accent-light)] disabled:opacity-50 transition-colors duration-300"
        >
          {createFlashcard.isPending ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="font-[family-name:var(--font-display)] text-xs px-4 py-2 border border-[var(--text)] text-[var(--text)] rounded hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
