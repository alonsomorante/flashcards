import { useNavigate } from 'react-router-dom';
import type { Chapter } from '../types/index';
import { useDeleteChapter } from '../hooks/useChapters';

interface ChapterCardProps {
  chapter: Chapter;
  flashcardCount?: number;
}

export function ChapterCard({ chapter, flashcardCount }: ChapterCardProps) {
  const navigate = useNavigate();
  const deleteChapter = useDeleteChapter();

  const handleDelete = () => {
    if (confirm(`¿Eliminar "${chapter.title}" y todas sus flashcards?`)) {
      deleteChapter.mutate(chapter.id, {
        onSuccess: () => navigate(-1),
      });
    }
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between items-start gap-2">
        <button
          onClick={() => navigate(`/chapters/${chapter.id}`)}
          className="text-left flex-1"
        >
          <h3 className="font-medium text-gray-900 hover:text-indigo-600">
            {chapter.title}
          </h3>
          {flashcardCount !== undefined && (
            <p className="text-sm text-gray-500">
              {flashcardCount} {flashcardCount === 1 ? 'flashcard' : 'flashcards'}
            </p>
          )}
        </button>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 text-sm"
          aria-label="Eliminar capítulo"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => navigate(`/chapters/${chapter.id}`)}
          className="text-sm px-3 py-1 border rounded hover:bg-gray-50"
        >
          Ver flashcards
        </button>
        <button
          onClick={() => navigate(`/chapters/${chapter.id}/study`)}
          className="text-sm px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Estudiar
        </button>
      </div>
    </div>
  );
}
