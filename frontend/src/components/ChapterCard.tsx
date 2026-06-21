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
    <button
      onClick={() => navigate(`/chapters/${chapter.id}`)}
      className="group text-left w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-500"
    >
      <div className="flex justify-between items-start mb-4">
        <span className="font-[family-name:var(--font-display)] text-xs text-[var(--text-muted)] tracking-widest uppercase">
          Capítulo {String(index).padStart(2, '0')}
        </span>
        <button
          onClick={handleDelete}
          className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-300 text-sm"
          aria-label="Eliminar capítulo"
        >
          ✕
        </button>
      </div>

      <h3 className="font-[family-name:var(--font-display)] text-xl font-medium mb-3 leading-tight group-hover:text-[var(--accent)] transition-colors duration-300">
        {chapter.title}
      </h3>

      <div className="border-t border-[var(--border)] pt-4 mt-4 flex justify-between items-center text-sm text-[var(--text-muted)] italic">
        <span>{new Date(chapter.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        <span className="group-hover:translate-x-1 transition-transform duration-300">Abrir →</span>
      </div>
    </button>
  );
}
