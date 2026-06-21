import { useNavigate } from 'react-router-dom';
import type { Book } from '../types/index';
import { useDeleteBook } from '../hooks/useBooks';

interface BookCardProps {
  book: Book;
  index: number;
}

export function BookCard({ book, index }: BookCardProps) {
  const navigate = useNavigate();
  const deleteBook = useDeleteBook();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`¿Eliminar "${book.title}"?`)) {
      deleteBook.mutate(book.id);
    }
  };

  return (
    <div
      onClick={() => navigate(`/books/${book.id}`)}
      className="group bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-5 hover:border-[var(--accent)] transition-colors duration-200 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
          Libro {String(index).padStart(2, '0')}
        </span>
        <button
          onClick={handleDelete}
          className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200"
          aria-label="Eliminar libro"
        >
          ✕
        </button>
      </div>

      <h3 className="text-lg font-semibold text-[var(--text)] mb-2 group-hover:text-[var(--accent)] transition-colors duration-200">
        {book.title}
      </h3>

      <div className="flex justify-between items-center text-sm text-[var(--text-muted)]">
        <span>{new Date(book.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
      </div>
    </div>
  );
}
