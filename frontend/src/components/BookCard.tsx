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

  const handleDelete = () => {
    if (confirm(`¿ELIMINAR REGISTRO "${book.title}"? ESTA ACCIÓN NO SE PUEDE DESHACER.`)) {
      deleteBook.mutate(book.id);
    }
  };

  const paddedIndex = String(index).padStart(3, '0');

  return (
    <div className="group border-2 border-[var(--border)] bg-[var(--bg-elevated)] hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors duration-0">
      <div className="border-b-2 border-[var(--border)] px-3 py-1 flex justify-between items-center bg-[var(--bg)] group-hover:bg-[var(--text)]">
        <span className="font-[family-name:var(--font-display)] text-[10px] tracking-widest text-[var(--text-muted)] group-hover:text-[var(--bg)]">
          FICHA #{paddedIndex}
        </span>
        <button
          onClick={handleDelete}
          className="font-[family-name:var(--font-display)] text-[10px] text-[var(--text-muted)] group-hover:text-[var(--bg)] hover:text-[var(--error)] transition-colors"
          aria-label="Eliminar libro"
        >
          [X]
        </button>
      </div>

      <button
        onClick={() => navigate(`/books/${book.id}`)}
        className="w-full text-left p-5"
      >
        <h3 className="font-[family-name:var(--font-display)] text-lg font-bold leading-tight mb-3 uppercase">
          {book.title}
        </h3>
        <div className="font-[family-name:var(--font-display)] text-[10px] text-[var(--text-muted)] group-hover:text-[var(--bg)] uppercase tracking-wider">
          {new Date(book.createdAt).toLocaleDateString('es-ES')} // ABrir
        </div>
      </button>

      <div className="border-t-2 border-[var(--border)] grid grid-cols-2">
        <button
          onClick={() => navigate(`/books/${book.id}`)}
          className="font-[family-name:var(--font-display)] text-[10px] py-2 text-center border-r-2 border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors uppercase tracking-wider"
        >
          Ver
        </button>
        <button
          onClick={() => navigate(`/books/${book.id}/study`)}
          className="font-[family-name:var(--font-display)] text-[10px] py-2 text-center hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors uppercase tracking-wider"
        >
          Estudiar
        </button>
      </div>
    </div>
  );
}
