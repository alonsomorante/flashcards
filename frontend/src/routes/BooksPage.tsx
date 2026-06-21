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
      <div className="text-center py-20 text-[var(--text-muted)] animate-pulse">
        Cargando libros...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--bg-elevated)] border border-[var(--accent)] rounded-xl p-6 text-center">
        <p className="text-[var(--accent)] font-medium">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-semibold mb-3 text-[var(--text)]">
          Tus libros
        </h2>
        <p className="text-[var(--text-muted)]">
          {books?.length || 0} {books?.length === 1 ? 'libro' : 'libros'} en tu colección
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2.5 rounded-full bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-dark)] transition-colors duration-300 shadow-md hover:shadow-lg"
        >
          {showForm ? 'Cancelar' : 'Nuevo libro'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-10 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-6 shadow-lg">
          <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
            Título del libro
          </label>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Ej: Historia del arte"
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
            autoFocus
          />
          <button
            type="submit"
            disabled={createBook.isPending}
            className="mt-4 w-full py-2.5 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-dark)] disabled:opacity-50 transition-colors"
          >
            {createBook.isPending ? 'Creando...' : 'Crear libro'}
          </button>
        </form>
      )}

      {books && books.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <p className="text-lg mb-2">No tienes libros todavía</p>
          <p className="text-sm">Crea tu primer libro para empezar a estudiar.</p>
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
