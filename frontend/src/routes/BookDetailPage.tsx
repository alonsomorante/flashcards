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
      <div className="font-[family-name:var(--font-display)] text-[var(--text-muted)] text-center py-20 italic animate-pulse">
        Cargando volumen...
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="border border-[var(--accent)] bg-[var(--bg-elevated)] p-8 text-center rounded">
        <span className="font-[family-name:var(--font-display)] text-[var(--accent)] italic text-lg">Volumen no encontrado</span>
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
          to="/"
          className="font-[family-name:var(--font-display)] text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300 italic"
        >
          ← Índice
        </Link>
      </div>

      <div className="text-center mb-12 pb-10 border-b border-[var(--border)]">
        <span className="font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] tracking-widest uppercase block mb-3">
          Libro
        </span>
        <h2 className="text-4xl md:text-6xl font-medium mb-4">{book.title}</h2>
        <p className="font-[family-name:var(--font-body)] italic text-[var(--text-muted)] text-lg">
          {book.chapters.length} {book.chapters.length === 1 ? 'capítulo' : 'capítulos'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
        <button
          onClick={() => navigate(`/books/${book.id}/study`)}
          className="font-[family-name:var(--font-display)] text-sm px-6 py-2 bg-[var(--accent)] text-[var(--bg)] rounded hover:bg-[var(--accent-light)] transition-colors duration-300"
        >
          Estudiar todo el libro
        </button>
        <button
          onClick={() => setShowForm(!showForm)}
          className="font-[family-name:var(--font-display)] text-sm px-6 py-2 border border-[var(--text)] text-[var(--text)] rounded hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300"
        >
          {showForm ? 'Cancelar' : 'Añadir capítulo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-12 bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-6 shadow-sm">
          <label className="block font-[family-name:var(--font-display)] text-sm text-[var(--text-muted)] mb-2 italic">
            Título del capítulo
          </label>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Ej: Introducción"
            className="w-full bg-transparent border-b border-[var(--border)] px-0 py-2 text-[var(--text)] text-lg focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--border)]"
            autoFocus
          />
          <button
            type="submit"
            disabled={createChapter.isPending}
            className="mt-4 font-[family-name:var(--font-display)] text-sm px-5 py-2 bg-[var(--accent)] text-[var(--bg)] rounded hover:bg-[var(--accent-light)] disabled:opacity-50 transition-colors duration-300"
          >
            {createChapter.isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      )}

      {book.chapters.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <p className="font-[family-name:var(--font-display)] italic text-xl mb-2">Sin capítulos</p>
          <p>Añade el primer capítulo para organizar tus flashcards.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {book.chapters.map((chapter, index) => (
            <ChapterCard key={chapter.id} chapter={chapter} index={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
