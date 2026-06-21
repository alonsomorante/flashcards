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
        className="w-full border border-dashed border-[var(--border)] rounded-lg p-4 text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-all duration-200 font-medium text-sm"
      >
        + Añadir nueva flashcard
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-5 space-y-4"
    >
      <p className="text-sm font-medium text-[var(--text-muted)]">Nueva flashcard</p>
      <div>
        <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">Frente</label>
        <textarea
          value={front}
          onChange={(e) => setFront(e.target.value)}
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          rows={2}
          placeholder="Escribe la pregunta..."
          autoFocus
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">Reverso</label>
        <textarea
          value={back}
          onChange={(e) => setBack(e.target.value)}
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          rows={2}
          placeholder="Escribe la respuesta..."
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createFlashcard.isPending}
          className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg-elevated)] font-medium hover:bg-[var(--accent-light)] disabled:opacity-50 transition-colors"
        >
          {createFlashcard.isPending ? 'Creando...' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)] transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
