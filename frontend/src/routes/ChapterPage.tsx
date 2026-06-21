import { useParams, Link, useNavigate } from 'react-router-dom';
import { useChapter } from '../hooks/useChapters';
import { FlashcardItem } from '../components/FlashcardItem';
import { FlashcardForm } from '../components/FlashcardForm';

export function ChapterPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { data: chapter, isLoading, error } = useChapter(chapterId);

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Cargando capítulo...</div>;
  }

  if (error || !chapter) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Capítulo no encontrado</p>
        <Link to="/" className="text-indigo-600 hover:underline">
          Volver a libros
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4">
        <Link to={`/books/${chapter.bookId}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Volver al libro
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{chapter.title}</h1>
        <button
          onClick={() => navigate(`/chapters/${chapter.id}/study`)}
          disabled={chapter.flashcards.length === 0}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          Estudiar capítulo
        </button>
      </div>

      <div className="space-y-3">
        {chapter.flashcards.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="mb-4">No tienes flashcards en este capítulo</p>
          </div>
        ) : (
          chapter.flashcards.map((flashcard) => (
            <FlashcardItem
              key={flashcard.id}
              flashcard={flashcard}
              chapterId={chapter.id}
            />
          ))
        )}

        <FlashcardForm chapterId={chapter.id} />
      </div>
    </div>
  );
}
