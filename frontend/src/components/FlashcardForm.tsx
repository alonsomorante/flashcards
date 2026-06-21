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
        className="w-full border border-dashed border-[var(--border-dim)] p-4 text-[var(--text-dim)] hover:text-[var(--text)] hover:border-[var(--text)] transition-colors text-sm font-[family-name:var(--font-display)]"
      >
        {'>'} touch nueva_ficha
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-[var(--border-dim)] bg-[var(--bg-elevated)] p-4 space-y-3"
    >
      <div className="text-[var(--text-dim)] text-xs mb-2">
        {'>'} creando_nueva_ficha --chapter={chapterId.slice(0, 8)}
      </div>
      <div>
        <span className="text-[var(--accent)] text-xs">$ frente&gt; </span>
        <textarea
          value={front}
          onChange={(e) => setFront(e.target.value)}
          className="w-full bg-[var(--bg)] border border-[var(--border-dim)] px-3 py-2 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text)] mt-1"
          rows={2}
          placeholder="escriba_la_pregunta"
          autoFocus
        />
      </div>
      <div>
        <span className="text-[var(--accent)] text-xs">$ reverso&gt; </span>
        <textarea
          value={back}
          onChange={(e) => setBack(e.target.value)}
          className="w-full bg-[var(--bg)] border border-[var(--border-dim)] px-3 py-2 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text)] mt-1"
          rows={2}
          placeholder="escriba_la_respuesta"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={createFlashcard.isPending}
          className="text-[var(--bg)] bg-[var(--text)] px-4 py-1 text-xs hover:bg-[var(--text-dim)] disabled:opacity-50 transition-colors"
        >
          {createFlashcard.isPending ? '...' : '[escribir]'}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="border border-[var(--border-dim)] px-4 py-1 text-xs hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors"
        >
          [cancelar]
        </button>
      </div>
    </form>
  );
}
