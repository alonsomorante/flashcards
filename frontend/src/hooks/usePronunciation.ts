import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export function useGeneratePronunciation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ flashcardId }: { flashcardId: string; chapterId: string }) =>
      api.generatePronunciation(flashcardId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chapter', variables.chapterId] });
    },
  });
}
