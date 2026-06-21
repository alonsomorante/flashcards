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
    return <div className="text-center py-8 text-gray-500">Cargando libros...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis libros</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {showForm ? 'Cancelar' : '+ Nuevo libro'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título del libro"
            className="flex-1 border rounded px-3 py-2"
            autoFocus
          />
          <button
            type="submit"
            disabled={createBook.isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {createBook.isPending ? 'Creando...' : 'Crear'}
          </button>
        </form>
      )}

      {books && books.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No tienes libros todavía</p>
          <p className="text-sm">Crea tu primer libro para empezar a estudiar</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {books?.map((book) => (
            <BookCard key={book.id} book={book} chapterCount={0} />
          ))}
        </div>
      )}
    </div>
  );
}
