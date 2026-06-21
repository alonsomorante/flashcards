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
    return <div className="text-center py-8 text-gray-500">Cargando libro...</div>;
  }

  if (error || !book) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Libro no encontrado</p>
        <Link to="/" className="text-indigo-600 hover:underline">
          Volver a libros
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
          ← Mis libros
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/books/${book.id}/study`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Estudiar todo el libro
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            {showForm ? 'Cancelar' : '+ Nuevo capítulo'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Título del capítulo"
            className="flex-1 border rounded px-3 py-2"
            autoFocus
          />
          <button
            type="submit"
            disabled={createChapter.isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {createChapter.isPending ? 'Creando...' : 'Crear'}
          </button>
        </form>
      )}

      {book.chapters.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No tienes capítulos todavía</p>
          <p className="text-sm">Crea tu primer capítulo para empezar</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {book.chapters.map((chapter) => (
            <ChapterCard key={chapter.id} chapter={chapter} />
          ))}
        </div>
      )}
    </div>
  );
}
