import { useMutation } from '@tanstack/react-query'
import { api } from '../api/client'

export function useSpellCheck() {
  return useMutation({
    mutationFn: (text: string) => api.spellCheck(text),
  })
}
