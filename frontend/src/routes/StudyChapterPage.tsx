import { useParams, useNavigate } from 'react-router-dom';
import { useChapterStudy } from '../hooks/useStudy';
import { StudySession } from '../components/StudySession';

export function StudyChapterPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { data: cards, isLoading, error } = useChapterStudy(chapterId);

  return (
    <StudySession
      cards={cards}
      isLoading={isLoading}
      error={error}
      backLabel="← Volver al capítulo"
      onBack={() => navigate(`/chapters/${chapterId}`)}
      title="Estudio por capítulo"
    />
  );
}
