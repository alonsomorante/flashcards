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
      <div className="font-[family-name:var(--font-display)] text-[var(--text-dim)] py-20 animate-pulse">
        {'>'} cargando_directorio...
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-[var(--accent)] bg-[var(--bg-elevated)] p-4">
        <span className="text-[var(--accent)]">{'>'} ERROR:</span>
        <p className="mt-1 text-[var(--text-dim)]">{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="border-b border-[var(--border-dim)] pb-3 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[var(--accent)]">root@estudio</span>
          <span className="text-[var(--text)]">:</span>
          <span className="text-[var(--warning)]">~/libros</span>
          <span className="text-[var(--text)]">$ ls -la</span>
        </div>
        <div className="text-[var(--text-dim)] text-sm">
          total {books?.length || 0}
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-[var(--text)] border border-[var(--border-dim)] px-4 py-2 hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors duration-100"
        >
          {showForm ? '[ cancelar ]' : '[ mkdir nuevo_libro ]'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 border border-[var(--border-dim)] bg-[var(--bg-elevated)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[var(--accent)]">root@estudio</span>
            <span className="text-[var(--text)]">:</span>
            <span className="text-[var(--warning)]">~/libros</span>
            <span className="text-[var(--text)]">$</span>
          </div>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="nombre_del_libro"
            className="w-full bg-[var(--bg)] border border-[var(--border-dim)] px-3 py-2 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text)]"
            autoFocus
          />
          <button
            type="submit"
            disabled={createBook.isPending}
            className="mt-3 text-[var(--bg)] bg-[var(--text)] px-4 py-1 hover:bg-[var(--text-dim)] disabled:opacity-50 transition-colors"
          >
            {createBook.isPending ? '...' : 'ejecutar'}
          </button>
        </form>
      )}

      {books && books.length === 0 ? (
        <div className="text-[var(--text-muted)] py-12">
          {'>'} directorio vacío. cree un libro para comenzar.
        </div>
      ) : (
        <div className="space-y-2">
          {books?.map((book, index) => (
            <BookCard key={book.id} book={book} index={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
