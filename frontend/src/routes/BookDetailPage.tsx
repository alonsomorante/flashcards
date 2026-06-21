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
      <div className="font-[family-name:var(--font-display)] text-[var(--text-dim)] py-20 animate-pulse">
        {'>'} cargando_volumen...
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="border border-[var(--accent)] bg-[var(--bg-elevated)] p-4">
        <span className="text-[var(--accent)]">{'>'} ERROR: VOLUMEN NO ENCONTRADO</span>
        <div className="mt-3">
          <Link to="/" className="text-[var(--text)] hover:text-[var(--accent)] transition-colors">
            {'>'} cd ..
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Link to="/" className="text-[var(--text-dim)] hover:text-[var(--text)] transition-colors text-sm">
          {'>'} cd ~/libros
        </Link>
      </div>

      <div className="border border-[var(--border-dim)] bg-[var(--bg-elevated)] p-4 mb-6">
        <div className="flex items-center gap-2 mb-3 text-xs text-[var(--text-dim)]">
          <span>FILE:</span>
          <span className="text-[var(--warning)]">{book.title.toLowerCase().replace(/\s+/g, '_')}</span>
        </div>
        <h2 className="text-2xl md:text-4xl text-[var(--text)] mb-3">
          {book.title}
        </h2>
        <div className="text-[var(--text-dim)] text-sm">
          {'>'} {book.chapters.length} capítulos detectados
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <button
          onClick={() => navigate(`/books/${book.id}/study`)}
          className="text-[var(--bg)] bg-[var(--text)] px-4 py-2 hover:bg-[var(--text-dim)] transition-colors"
        >
          [ ./estudiar_libro ]
        </button>
        <button
          onClick={() => setShowForm(!showForm)}
          className="border border-[var(--border-dim)] px-4 py-2 hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors"
        >
          {showForm ? '[ cancelar ]' : '[ mkdir capítulo ]'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 border border-[var(--border-dim)] bg-[var(--bg-elevated)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[var(--accent)]">root@estudio</span>
            <span className="text-[var(--text)]">:</span>
            <span className="text-[var(--warning)]">~/{book.title.toLowerCase().replace(/\s+/g, '_')}</span>
            <span className="text-[var(--text)]">$</span>
          </div>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="nombre_del_capítulo"
            className="w-full bg-[var(--bg)] border border-[var(--border-dim)] px-3 py-2 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text)]"
            autoFocus
          />
          <button
            type="submit"
            disabled={createChapter.isPending}
            className="mt-3 text-[var(--bg)] bg-[var(--text)] px-4 py-1 hover:bg-[var(--text-dim)] disabled:opacity-50 transition-colors"
          >
            {createChapter.isPending ? '...' : 'ejecutar'}
          </button>
        </form>
      )}

      {book.chapters.length === 0 ? (
        <div className="text-[var(--text-muted)] py-12">
          {'>'} no se encontraron capítulos. cree uno para continuar.
        </div>
      ) : (
        <div className="space-y-2">
          {book.chapters.map((chapter, index) => (
            <ChapterCard key={chapter.id} chapter={chapter} index={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
