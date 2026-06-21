import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

const BOOKS_KEY = ['books'] as const;

export function useBooks() {
  return useQuery({
    queryKey: BOOKS_KEY,
    queryFn: api.getBooks,
  });
}

export function useBook(id: string | undefined) {
  return useQuery({
    queryKey: ['book', id],
    queryFn: () => api.getBook(id!),
    enabled: !!id,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => api.createBook(title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BOOKS_KEY }),
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      api.updateBook(id, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BOOKS_KEY }),
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteBook(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BOOKS_KEY }),
  });
}
