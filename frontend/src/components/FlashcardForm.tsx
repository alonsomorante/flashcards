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
        className="w-full border-2 border-dashed border-[var(--detail)]/30 rounded-2xl p-5 text-[var(--detail)] hover:text-[var(--detail-dark)] hover:border-[var(--detail)] hover:bg-[var(--detail)]/5 transition-all duration-300 font-medium"
      >
        + Añadir nueva flashcard
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-6 shadow-md space-y-4"
    >
      <p className="text-sm font-medium text-[var(--text-muted)]">Nueva flashcard</p>
      <div>
        <label className="block text-xs font-semibold text-[var(--detail)] uppercase tracking-wider mb-1">Frente</label>
        <textarea
          value={front}
          onChange={(e) => setFront(e.target.value)}
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
          rows={2}
          placeholder="Escribe la pregunta..."
          autoFocus
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-[var(--detail)] uppercase tracking-wider mb-1">Reverso</label>
        <textarea
          value={back}
          onChange={(e) => setBack(e.target.value)}
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
          rows={2}
          placeholder="Escribe la respuesta..."
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createFlashcard.isPending}
          className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-dark)] disabled:opacity-50 transition-colors"
        >
          {createFlashcard.isPending ? 'Creando...' : 'Crear'}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--detail)] hover:text-[var(--detail)] transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
