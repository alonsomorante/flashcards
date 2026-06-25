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

export const languageCodeSchema = z.string().trim().min(2).max(10);

export const createFlashcardSchema = z.object({
  front: z.string().trim().min(1),
  back: z.string().trim().min(1),
  frontLanguage: languageCodeSchema.default('es-ES'),
  backLanguage: languageCodeSchema.default('es-ES'),
});

export const updateFlashcardSchema = z.object({
  front: z.string().trim().min(1).optional(),
  back: z.string().trim().min(1).optional(),
  frontLanguage: languageCodeSchema.optional(),
  backLanguage: languageCodeSchema.optional(),
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
