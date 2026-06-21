import { useNavigate } from 'react-router-dom';
import type { Chapter } from '../types/index';
import { useDeleteChapter } from '../hooks/useChapters';

interface ChapterCardProps {
  chapter: Chapter;
  index: number;
}

export function ChapterCard({ chapter, index }: ChapterCardProps) {
  const navigate = useNavigate();
  const deleteChapter = useDeleteChapter();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`¿Eliminar "${chapter.title}"?`)) {
      deleteChapter.mutate(chapter.id);
    }
  };

  return (
    <div
      onClick={() => navigate(`/chapters/${chapter.id}`)}
      className="group bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-[var(--detail)] transition-all duration-300 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold text-[var(--detail)] uppercase tracking-wider">
          Capítulo {String(index).padStart(2, '0')}
        </span>
        <button
          onClick={handleDelete}
          className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-200"
          aria-label="Eliminar capítulo"
        >
          ✕
        </button>
      </div>

      <h3 className="text-lg font-semibold text-[var(--text)] mb-3 group-hover:text-[var(--accent)] transition-colors duration-300">
        {chapter.title}
      </h3>

      <div className="flex justify-between items-center text-sm text-[var(--text-muted)]">
        <span>{new Date(chapter.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        <span className="group-hover:translate-x-1 transition-transform duration-300 text-[var(--detail)]">→</span>
      </div>
    </div>
  );
}
