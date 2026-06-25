import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export function useCreateFlashcard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      chapterId,
      front,
      back,
      frontLanguage,
      backLanguage,
    }: {
      chapterId: string;
      front: string;
      back: string;
      frontLanguage: string;
      backLanguage: string;
    }) => api.createFlashcard(chapterId, front, back, frontLanguage, backLanguage),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chapter', variables.chapterId] });
    },
  });
}

export function useUpdateFlashcard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      front,
      back,
      frontLanguage,
      backLanguage,
    }: {
      id: string;
      front?: string;
      back?: string;
      frontLanguage?: string;
      backLanguage?: string;
      chapterId: string;
    }) => api.updateFlashcard(id, { front, back, frontLanguage, backLanguage }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chapter', variables.chapterId] });
    },
  });
}

export function useDeleteFlashcard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
    }: {
      id: string;
      chapterId: string;
    }) => api.deleteFlashcard(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chapter', variables.chapterId] });
    },
  });
}
