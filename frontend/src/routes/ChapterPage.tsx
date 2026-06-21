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
      <div className="text-center py-20 text-[var(--text-muted)] animate-pulse">
        Cargando capítulo...
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="bg-[var(--bg-elevated)] border border-[var(--accent)] rounded-xl p-6 text-center">
        <p className="text-[var(--accent)] font-medium">Capítulo no encontrado</p>
        <Link to="/" className="mt-4 inline-block text-[var(--detail)] hover:underline">
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
          className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          ← Volver al libro
        </Link>
      </div>

      <div className="text-center mb-10 pb-8 border-b border-[var(--border)]">
        <span className="inline-block px-3 py-1 rounded-full bg-[var(--detail)]/10 text-[var(--detail)] text-xs font-semibold uppercase tracking-wider mb-4">
          Capítulo
        </span>
        <h2 className="text-3xl md:text-4xl font-semibold mb-3">{chapter.title}</h2>
        <p className="text-[var(--text-muted)]">
          {chapter.flashcards.length} {chapter.flashcards.length === 1 ? 'flashcard' : 'flashcards'}
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <button
          onClick={() => navigate(`/chapters/${chapter.id}/study`)}
          disabled={chapter.flashcards.length === 0}
          className="px-6 py-2.5 rounded-full bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-dark)] disabled:opacity-50 transition-colors duration-300 shadow-md"
        >
          Estudiar capítulo
        </button>
      </div>

      <div className="space-y-4">
        {chapter.flashcards.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <p className="text-lg mb-2">No hay flashcards todavía</p>
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
