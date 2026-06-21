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
      <div className="font-[family-name:var(--font-display)] text-[var(--text-dim)] py-20 animate-pulse">
        {'>'} cargando_capítulo...
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="border border-[var(--accent)] bg-[var(--bg-elevated)] p-4">
        <span className="text-[var(--accent)]">{'>'} ERROR: CAPÍTULO NO ENCONTRADO</span>
        <div className="mt-3">
          <Link to="/" className="text-[var(--text)] hover:text-[var(--accent)] transition-colors">
            {'>'} cd ~
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          to={`/books/${chapter.bookId}`}
          className="text-[var(--text-dim)] hover:text-[var(--text)] transition-colors text-sm"
        >
          {'>'} cd ..
        </Link>
      </div>

      <div className="border border-[var(--border-dim)] bg-[var(--bg-elevated)] p-4 mb-6">
        <div className="flex items-center gap-2 mb-2 text-xs text-[var(--text-dim)]">
          <span>DIR:</span>
          <span className="text-[var(--warning)]">{chapter.title.toLowerCase().replace(/\s+/g, '_')}</span>
        </div>
        <h2 className="text-2xl md:text-3xl text-[var(--text)] mb-2">
          {chapter.title}
        </h2>
        <div className="text-[var(--text-dim)] text-sm">
          {'>'} {chapter.flashcards.length} fichas en memoria
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={() => navigate(`/chapters/${chapter.id}/study`)}
          disabled={chapter.flashcards.length === 0}
          className="text-[var(--bg)] bg-[var(--text)] px-4 py-2 hover:bg-[var(--text-dim)] disabled:opacity-50 transition-colors"
        >
          [ ./estudiar_capítulo ]
        </button>
      </div>

      <div className="space-y-2">
        {chapter.flashcards.length === 0 ? (
          <div className="text-[var(--text-muted)] py-12">
            {'>'} no se encontraron fichas. añada una para comenzar.
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
