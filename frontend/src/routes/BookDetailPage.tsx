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
      <div className="text-center py-20 text-[var(--text-muted)]">
        Cargando libro...
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-6 text-center">
        <p className="text-[var(--text)] font-medium">Libro no encontrado</p>
        <Link to="/" className="mt-4 inline-block text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
          ← Volver a libros
        </Link>
      </div>

      <div className="mb-8 pb-6 border-b border-[var(--border)]">
        <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
          Libro
        </span>
        <h2 className="text-3xl font-semibold mt-1 mb-2">{book.title}</h2>
        <p className="text-[var(--text-muted)]">
          {book.chapters.length} {book.chapters.length === 1 ? 'capítulo' : 'capítulos'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <button
          onClick={() => navigate(`/books/${book.id}/study`)}
          className="px-5 py-2 rounded-lg bg-[var(--accent)] text-[var(--bg-elevated)] font-medium hover:bg-[var(--accent-light)] transition-colors duration-200"
        >
          Estudiar libro
        </button>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2 rounded-lg border border-[var(--border)] text-[var(--text)] font-medium hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors duration-200"
        >
          {showForm ? 'Cancelar' : 'Nuevo capítulo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="max-w-md mb-10 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-5">
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
            Título del capítulo
          </label>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Ej: Introducción"
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            autoFocus
          />
          <button
            type="submit"
            disabled={createChapter.isPending}
            className="mt-4 w-full py-2.5 rounded-lg bg-[var(--accent)] text-[var(--bg-elevated)] font-medium hover:bg-[var(--accent-light)] disabled:opacity-50 transition-colors"
          >
            {createChapter.isPending ? 'Creando...' : 'Crear capítulo'}
          </button>
        </form>
      )}

      {book.chapters.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <p className="text-base mb-1">No hay capítulos todavía</p>
          <p className="text-sm">Añade el primer capítulo para organizar tus flashcards.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {book.chapters.map((chapter, index) => (
            <ChapterCard key={chapter.id} chapter={chapter} index={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
