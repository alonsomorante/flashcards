import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBook } from '../hooks/useBooks';
import { useCreateChapter } from '../hooks/useChapters';
import { ChapterCard } from '../components/ChapterCard';

export function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { data: book, isLoading, error } = useBook(bookId);
  const createChapter = useCreateChapter();
  const [newTitle, setNewTitle] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !bookId) return;
    createChapter.mutate(
      { bookId, title: newTitle.trim() },
      {
        onSuccess: () => {
          setNewTitle('');
          setShowForm(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="font-[family-name:var(--font-display)] text-[var(--text-muted)] text-center py-16 animate-pulse">
        CARGANDO REGISTRO...
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="border-2 border-[var(--error)] bg-[var(--bg-elevated)] p-6 text-center">
        <span className="font-[family-name:var(--font-display)] text-[var(--error)]">REGISTRO NO ENCONTRADO</span>
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
      <div className="mb-6">
        <Link
          to="/"
          className="font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          [← ÍNDICE]
        </Link>
      </div>

      <div className="border-2 border-[var(--border)] bg-[var(--bg-elevated)] p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b-2 border-[var(--border)] pb-4 mb-4">
          <div>
            <span className="font-[family-name:var(--font-display)] text-[10px] text-[var(--text-muted)] tracking-widest">
              LIBRO // {book.id.slice(0, 8).toUpperCase()}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 uppercase leading-none">
              {book.title}
            </h2>
          </div>
          <div className="font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)]">
            {book.chapters.length} CAPÍTULOS
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(`/books/${book.id}/study`)}
            className="font-[family-name:var(--font-display)] text-sm px-6 py-3 bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-dim)] transition-colors uppercase tracking-wide"
          >
            [ ESTUDIAR LIBRO ]
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="font-[family-name:var(--font-display)] text-sm px-6 py-3 border-2 border-[var(--border)] hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors uppercase tracking-wide"
          >
            {showForm ? '[ CANCELAR ]' : '[ + CAPÍTULO ]'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 border-2 border-[var(--border)] bg-[var(--bg-elevated)] p-4 flex flex-col sm:flex-row gap-3">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="TÍTULO DEL CAPÍTULO"
            className="flex-1 bg-[var(--bg)] border-2 border-[var(--border)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            autoFocus
          />
          <button
            type="submit"
            disabled={createChapter.isPending}
            className="font-[family-name:var(--font-display)] text-sm px-6 py-3 bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-dim)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
          >
            {createChapter.isPending ? 'ARCHIVANDO...' : 'ARCHIVAR'}
          </button>
        </form>
      )}

      {book.chapters.length === 0 ? (
        <div className="border-2 border-dashed border-[var(--text-muted)] p-12 text-center">
          <p className="font-[family-name:var(--font-display)] text-[var(--text-muted)] text-sm mb-2">
            SIN CAPÍTULOS
          </p>
          <p className="text-[var(--text-muted)]">Añade el primer capítulo para organizar tus flashcards.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {book.chapters.map((chapter, index) => (
            <ChapterCard key={chapter.id} chapter={chapter} index={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
