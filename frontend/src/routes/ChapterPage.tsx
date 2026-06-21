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
      <div className="font-[family-name:var(--font-display)] text-[var(--text-muted)] text-center py-20 italic animate-pulse">
        Cargando capítulo...
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="border border-[var(--accent)] bg-[var(--bg-elevated)] p-8 text-center rounded">
        <span className="font-[family-name:var(--font-display)] text-[var(--accent)] italic text-lg">Capítulo no encontrado</span>
        <div className="mt-4">
          <Link to="/" className="text-[var(--accent)] hover:underline italic">
            ← Volver al índice
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          to={`/books/${chapter.bookId}`}
          className="font-[family-name:var(--font-display)] text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300 italic"
        >
          ← Volver al libro
        </Link>
      </div>

      <div className="text-center mb-12 pb-10 border-b border-[var(--border)]">
        <span className="font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] tracking-widest uppercase block mb-3">
          Capítulo
        </span>
        <h2 className="text-3xl md:text-5xl font-medium mb-4">{chapter.title}</h2>
        <p className="font-[family-name:var(--font-body)] italic text-[var(--text-muted)] text-lg">
          {chapter.flashcards.length} {chapter.flashcards.length === 1 ? 'flashcard' : 'flashcards'}
        </p>
      </div>

      <div className="flex justify-center mb-12">
        <button
          onClick={() => navigate(`/chapters/${chapter.id}/study`)}
          disabled={chapter.flashcards.length === 0}
          className="font-[family-name:var(--font-display)] text-sm px-6 py-2 bg-[var(--accent)] text-[var(--bg)] rounded hover:bg-[var(--accent-light)] disabled:opacity-50 transition-colors duration-300"
        >
          Estudiar capítulo
        </button>
      </div>

      <div className="space-y-6">
        {chapter.flashcards.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <p className="font-[family-name:var(--font-display)] italic text-xl mb-2">Sin flashcards</p>
            <p>Añade flashcards para comenzar a estudiar.</p>
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
