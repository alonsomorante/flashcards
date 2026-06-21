import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().trim().min(1).max(255),
});

export const updateBookSchema = z.object({
  title: z.string().trim().min(1).max(255),
});

export const createChapterSchema = z.object({
  title: z.string().trim().min(1).max(255),
});

export const updateChapterSchema = z.object({
  title: z.string().trim().min(1).max(255),
});

export const createFlashcardSchema = z.object({
  front: z.string().trim().min(1),
  back: z.string().trim().min(1),
});

export const updateFlashcardSchema = z.object({
  front: z.string().trim().min(1).optional(),
  back: z.string().trim().min(1).optional(),
});

export const reviewFlashcardSchema = z.object({
  level: z.number().int().min(0).max(3),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;
export type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>;
export type UpdateFlashcardInput = z.infer<typeof updateFlashcardSchema>;
export type ReviewFlashcardInput = z.infer<typeof reviewFlashcardSchema>;
