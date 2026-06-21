import { useParams, useNavigate } from 'react-router-dom';
import { useBookStudy } from '../hooks/useStudy';
import { StudySession } from '../components/StudySession';

export function StudyBookPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { data: cards, isLoading, error } = useBookStudy(bookId);

  return (
    <StudySession
      cards={cards}
      isLoading={isLoading}
      error={error}
      backLabel="← Volver al libro"
      onBack={() => navigate(`/books/${bookId}`)}
      title="Estudio por libro (aleatorio)"
    />
  );
}
