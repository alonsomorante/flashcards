import { useNavigate } from 'react-router-dom';
import type { Book } from '../types/index';
import { useDeleteBook } from '../hooks/useBooks';

interface BookCardProps {
  book: Book;
  chapterCount?: number;
}

export function BookCard({ book, chapterCount }: BookCardProps) {
  const navigate = useNavigate();
  const deleteBook = useDeleteBook();

  const handleDelete = () => {
    if (confirm(`¿Eliminar "${book.title}" y todos sus capítulos y flashcards?`)) {
      deleteBook.mutate(book.id);
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between items-start gap-2">
        <button
          onClick={() => navigate(`/books/${book.id}`)}
          className="text-left flex-1"
        >
          <h3 className="font-medium text-lg text-gray-900 hover:text-indigo-600">
            {book.title}
          </h3>
          {chapterCount !== undefined && (
            <p className="text-sm text-gray-500">
              {chapterCount} {chapterCount === 1 ? 'capítulo' : 'capítulos'}
            </p>
          )}
        </button>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 text-sm"
          aria-label="Eliminar libro"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => navigate(`/books/${book.id}`)}
          className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
        >
          Ver capítulos
        </button>
        <button
          onClick={() => navigate(`/books/${book.id}/study`)}
          className="text-sm px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Estudiar libro
        </button>
      </div>
    </div>
  );
}
