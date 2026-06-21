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
    if (confirm(`¿ELIMINAR CAPÍTULO "${chapter.title}"?`)) {
      deleteChapter.mutate(chapter.id);
    }
  };

  const paddedIndex = String(index).padStart(3, '0');

  return (
    <div
      onClick={() => navigate(`/chapters/${chapter.id}`)}
      className="group flex items-center justify-between border border-[var(--border-dim)] bg-[var(--bg-elevated)] px-4 py-3 hover:border-[var(--text)] hover:bg-[var(--text)] hover:text-[var(--bg)] transition-colors duration-100 cursor-pointer"
    >
      <div className="flex items-center gap-4 overflow-hidden">
        <span className="text-[var(--text-dim)] group-hover:text-[var(--bg)] font-[family-name:var(--font-display)] text-xs">
          {paddedIndex}
        </span>
        <span className="text-[var(--warning)] group-hover:text-[var(--bg)] font-[family-name:var(--font-display)] text-sm truncate">
          {chapter.title.toLowerCase().replace(/\s+/g, '_')}
        </span>
        <span className="text-[var(--text-muted)] group-hover:text-[var(--bg)] text-xs hidden sm:inline">
          dir
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/chapters/${chapter.id}/study`);
          }}
          className="text-[var(--text-dim)] group-hover:text-[var(--bg)] text-xs hover:underline"
        >
          [estudiar]
        </button>
        <button
          onClick={handleDelete}
          className="text-[var(--text-dim)] group-hover:text-[var(--bg)] text-xs hover:text-[var(--accent)]"
        >
          [rm]
        </button>
      </div>
    </div>
  );
}
