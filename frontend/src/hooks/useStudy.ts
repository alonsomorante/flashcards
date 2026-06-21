import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import type { ReviewLevel } from '../types/index';

export function useChapterStudy(id: string | undefined) {
  return useQuery({
    queryKey: ['chapter-study', id],
    queryFn: () => api.getChapterStudy(id!),
    enabled: !!id,
  });
}

export function useBookStudy(id: string | undefined) {
  return useQuery({
    queryKey: ['book-study', id],
    queryFn: () => api.getBookStudy(id!),
    enabled: !!id,
  });
}

export function useReviewFlashcard() {
  return useMutation({
    mutationFn: ({ id, level }: { id: string; level: ReviewLevel }) =>
      api.reviewFlashcard(id, level),
  });
}
