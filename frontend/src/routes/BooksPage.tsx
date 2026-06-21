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
      <div className="font-[family-name:var(--font-display)] text-[var(--text-muted)] text-center py-20 italic animate-pulse">
        Cargando el índice...
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-[var(--accent)] bg-[var(--bg-elevated)] p-8 text-center rounded">
        <span className="font-[family-name:var(--font-display)] text-[var(--accent)] italic text-lg">Error de conexión</span>
        <p className="mt-2 text-[var(--text-muted)]">{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-12 pb-8 border-b border-[var(--border)]">
        <h2 className="text-4xl md:text-6xl font-medium mb-3">Índice de Libros</h2>
        <p className="font-[family-name:var(--font-body)] italic text-[var(--text-muted)] text-lg">
          {books?.length || 0} {books?.length === 1 ? 'volumen' : 'volúmenes'} en la colección
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <button
          onClick={() => setShowForm(!showForm)}
          className="font-[family-name:var(--font-display)] text-sm px-6 py-2 border border-[var(--text)] text-[var(--text)] rounded hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300"
        >
          {showForm ? 'Cancelar' : 'Añadir nuevo libro'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-12 bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-6 shadow-sm">
          <label className="block font-[family-name:var(--font-display)] text-sm text-[var(--text-muted)] mb-2 italic">
            Título del libro
          </label>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Ej: Historia del arte"
            className="w-full bg-transparent border-b border-[var(--border)] px-0 py-2 text-[var(--text)] text-lg focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--border)]"
            autoFocus
          />
          <button
            type="submit"
            disabled={createBook.isPending}
            className="mt-4 font-[family-name:var(--font-display)] text-sm px-5 py-2 bg-[var(--accent)] text-[var(--bg)] rounded hover:bg-[var(--accent-light)] disabled:opacity-50 transition-colors duration-300"
          >
            {createBook.isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </form>
      )}

      {books && books.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <p className="font-[family-name:var(--font-display)] italic text-xl mb-2">La colección está vacía</p>
          <p>Añade tu primer libro para comenzar a estudiar.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {books?.map((book, index) => (
            <BookCard key={book.id} book={book} index={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
