import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export function useChapter(id: string | undefined) {
  return useQuery({
    queryKey: ['chapter', id],
    queryFn: () => api.getChapter(id!),
    enabled: !!id,
  });
}

export function useCreateChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, title }: { bookId: string; title: string }) =>
      api.createChapter(bookId, title),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['book', variables.bookId] });
    },
  });
}

export function useUpdateChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      api.updateChapter(id, title),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chapter', data.id] });
      queryClient.invalidateQueries({ queryKey: ['book', data.bookId] });
    },
  });
}

export function useDeleteChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteChapter(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['books'] }),
  });
}
