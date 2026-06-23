import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Chapter } from '../types/index';
import { useDeleteChapter } from '../hooks/useChapters';
import { ConfirmDialog } from './ConfirmDialog';

interface ChapterCardProps {
  chapter: Chapter;
  index: number;
}

export function ChapterCard({ chapter, index }: ChapterCardProps) {
  const navigate = useNavigate();
  const deleteChapter = useDeleteChapter();
  const [showDialog, setShowDialog] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDialog(true);
  };

  const handleConfirm = () => {
    deleteChapter.mutate(chapter.id);
    setShowDialog(false);
  };

  return (
    <>
      <div
        onClick={() => navigate(`/chapters/${chapter.id}`)}
        className="group bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg p-5 hover:border-[var(--accent)] transition-colors duration-200 cursor-pointer"
      >
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
            Capítulo {String(index).padStart(2, '0')}
          </span>
          <button
            onClick={handleDeleteClick}
            className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors duration-200"
            aria-label="Eliminar capítulo"
          >
            ✕
          </button>
        </div>

        <h3 className="text-lg font-semibold text-[var(--text)] mb-2 group-hover:text-[var(--accent)] transition-colors duration-200">
          {chapter.title}
        </h3>

        <div className="flex justify-between items-center text-sm text-[var(--text-muted)]">
          <span>{new Date(chapter.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className="group-hover:translate-x-0.5 transition-transform duration-200">→</span>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDialog}
        title={`Eliminar "${chapter.title}"`}
        message="¿Estás seguro? Esta acción no se puede deshacer."
        onConfirm={handleConfirm}
        onCancel={() => setShowDialog(false)}
      />
    </>
  );
}
