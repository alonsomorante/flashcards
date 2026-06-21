import { useParams, Link, useNavigate } from 'react-router-dom';
import { useChapter } from '../hooks/useChapters';
import { FlashcardItem } from '../components/FlashcardItem';
import { FlashcardForm } from '../components/FlashcardForm';

export function ChapterPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { data: chapter, isLoading, error } = useChapter(chapterId);

  if (isLoading) {
    return (
      <div className="text-center py-20 text-[var(--text-muted)]">
        Cargando capítulo...
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-6 text-center">
        <p className="text-[var(--text)] font-medium">Capítulo no encontrado</p>
        <Link to="/" className="mt-4 inline-block text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to={`/books/${chapter.bookId}`}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
        >
          ← Volver al libro
        </Link>
      </div>

      <div className="mb-8 pb-6 border-b border-[var(--border)]">
        <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
          Capítulo
        </span>
        <h2 className="text-3xl font-semibold mt-1 mb-2">{chapter.title}</h2>
        <p className="text-[var(--text-muted)]">
          {chapter.flashcards.length} {chapter.flashcards.length === 1 ? 'flashcard' : 'flashcards'}
        </p>
      </div>

      <div className="flex mb-8">
        <button
          onClick={() => navigate(`/chapters/${chapter.id}/study`)}
          disabled={chapter.flashcards.length === 0}
          className="px-5 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg-elevated)] font-medium hover:bg-[var(--accent-light)] disabled:opacity-50 transition-colors duration-200"
        >
          Estudiar capítulo
        </button>
      </div>

      <div className="space-y-3">
        {chapter.flashcards.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <p className="text-base mb-1">No hay flashcards todavía</p>
            <p className="text-sm">Añade tu primera flashcard para comenzar a estudiar.</p>
          </div>
        ) : (
          chapter.flashcards.map((flashcard, index) => (
            <FlashcardItem
              key={flashcard.id}
              flashcard={flashcard}
              chapterId={chapter.id}
              index={index + 1}
            />
          ))
        )}

        <FlashcardForm chapterId={chapter.id} />
      </div>
    </div>
  );
}
