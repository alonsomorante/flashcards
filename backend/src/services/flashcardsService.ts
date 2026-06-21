import { eq } from 'drizzle-orm';
import { db } from '../db';
import { flashcards } from '../db/schema';
import type { CreateFlashcardInput, UpdateFlashcardInput } from '../validators/schemas';

export async function createFlashcard(chapterId: string, data: CreateFlashcardInput) {
  const [flashcard] = await db
    .insert(flashcards)
    .values({ ...data, chapterId })
    .returning();

  return flashcard;
}

export async function updateFlashcard(id: string, data: UpdateFlashcardInput) {
  const [flashcard] = await db
    .update(flashcards)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(flashcards.id, id))
    .returning();

  return flashcard ?? null;
}

export async function deleteFlashcard(id: string) {
  const [flashcard] = await db.delete(flashcards).where(eq(flashcards.id, id)).returning();
  return flashcard ?? null;
}
