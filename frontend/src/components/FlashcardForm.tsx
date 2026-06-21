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
        className="w-full border-2 border-dashed border-[var(--text-muted)] p-5 text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors font-[family-name:var(--font-display)] text-sm uppercase tracking-wide"
      >
        [ + NUEVA FICHA ]
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-2 border-[var(--border)] bg-[var(--bg-elevated)] p-4 space-y-3"
    >
      <div className="border-b-2 border-[var(--border)] pb-2 mb-3">
        <span className="font-[family-name:var(--font-display)] text-[10px] text-[var(--text-muted)] tracking-widest">
          NUEVA FICHA
        </span>
      </div>
      <textarea
        value={front}
        onChange={(e) => setFront(e.target.value)}
        className="w-full bg-[var(--bg)] border-2 border-[var(--border)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        rows={2}
        placeholder="FRENTE (PREGUNTA)"
        autoFocus
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
          type="submit"
          disabled={createFlashcard.isPending}
          className="font-[family-name:var(--font-display)] text-xs px-4 py-2 bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-dim)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
        >
          {createFlashcard.isPending ? 'ARCHIVANDO...' : 'ARCHIVAR'}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="font-[family-name:var(--font-display)] text-xs px-4 py-2 border-2 border-[var(--border)] hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors uppercase tracking-wide"
        >
          CANCELAR
        </button>
      </div>
    </form>
  );
}
