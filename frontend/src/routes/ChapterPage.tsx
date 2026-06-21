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
      <div className="font-[family-name:var(--font-display)] text-[var(--text-muted)] text-center py-16 animate-pulse">
        CARGANDO CAPÍTULO...
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="border-2 border-[var(--error)] bg-[var(--bg-elevated)] p-6 text-center">
        <span className="font-[family-name:var(--font-display)] text-[var(--error)]">CAPÍTULO NO ENCONTRADO</span>
        <div className="mt-4">
          <Link to="/" className="text-[var(--accent)] hover:underline font-[family-name:var(--font-display)] text-sm">
            [← VOLVER AL ÍNDICE]
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <Link
          to={`/books/${chapter.bookId}`}
          className="font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          [← LIBRO]
        </Link>
      </div>

      <div className="border-2 border-[var(--border)] bg-[var(--bg-elevated)] p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-2 border-[var(--border)] pb-4 mb-4">
          <div>
            <span className="font-[family-name:var(--font-display)] text-[10px] text-[var(--text-muted)] tracking-widest">
              CAPÍTULO // {chapter.id.slice(0, 8).toUpperCase()}
            </span>
            <h2 className="text-2xl md:text-4xl font-bold mt-2 uppercase leading-none">
              {chapter.title}
            </h2>
          </div>
          <div className="font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)]">
            {chapter.flashcards.length} FICHAS
          </div>
        </div>

        <button
          onClick={() => navigate(`/chapters/${chapter.id}/study`)}
          disabled={chapter.flashcards.length === 0}
          className="font-[family-name:var(--font-display)] text-sm px-6 py-3 bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-dim)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
        >
          [ ESTUDIAR CAPÍTULO ]
        </button>
      </div>

      <div className="space-y-4">
        {chapter.flashcards.length === 0 ? (
          <div className="border-2 border-dashed border-[var(--text-muted)] p-12 text-center">
            <p className="font-[family-name:var(--font-display)] text-[var(--text-muted)] text-sm mb-2">
              SIN FICHAS
            </p>
            <p className="text-[var(--text-muted)]">Añade flashcards para comenzar a estudiar.</p>
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
