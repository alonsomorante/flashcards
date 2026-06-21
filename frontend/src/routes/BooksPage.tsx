import { useState } from 'react';
import { useBooks, useCreateBook } from '../hooks/useBooks';
import { BookCard } from '../components/BookCard';

export function BooksPage() {
  const { data: books, isLoading, error } = useBooks();
  const createBook = useCreateBook();
  const [newTitle, setNewTitle] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createBook.mutate(newTitle.trim(), {
      onSuccess: () => {
        setNewTitle('');
        setShowForm(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="font-[family-name:var(--font-display)] text-[var(--text-muted)] text-center py-16 animate-pulse">
        CARGANDO ARCHIVO...
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-[var(--error)] bg-[var(--bg-elevated)] p-6 text-center">
        <span className="font-[family-name:var(--font-display)] text-[var(--error)]">ERROR DE CONEXIÓN</span>
        <p className="mt-2 text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b-2 border-[var(--border)] pb-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold">ÍNDICE DE LIBROS</h2>
          <p className="font-[family-name:var(--font-display)] text-[var(--text-muted)] text-xs mt-1">
            {books?.length || 0} REGISTROS ENCONTRADOS
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="font-[family-name:var(--font-display)] text-sm px-5 py-3 border-2 border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors uppercase tracking-wide"
        >
          {showForm ? '[ CANCELAR ]' : '[ + NUEVO LIBRO ]'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 border-2 border-[var(--border)] bg-[var(--bg-elevated)] p-4 flex flex-col sm:flex-row gap-3">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="TÍTULO DEL LIBRO"
            className="flex-1 bg-[var(--bg)] border-2 border-[var(--border)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            autoFocus
          />
          <button
            type="submit"
            disabled={createBook.isPending}
            className="font-[family-name:var(--font-display)] text-sm px-6 py-3 bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-dim)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
          >
            {createBook.isPending ? 'ARCHIVANDO...' : 'ARCHIVAR'}
          </button>
        </form>
      )}

      {books && books.length === 0 ? (
        <div className="border-2 border-dashed border-[var(--text-muted)] p-12 text-center">
          <p className="font-[family-name:var(--font-display)] text-[var(--text-muted)] text-sm mb-2">
            ARCHIVO VACÍO
          </p>
          <p className="text-[var(--text-muted)]">Crea tu primer libro para iniciar el registro de estudio.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books?.map((book, index) => (
            <BookCard key={book.id} book={book} index={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
