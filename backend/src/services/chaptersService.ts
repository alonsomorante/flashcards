import { eq } from 'drizzle-orm';
import { db } from '../db';
import { chapters } from '../db/schema';
import type { CreateChapterInput, UpdateChapterInput } from '../validators/schemas';

export async function getChapterById(id: string) {
  const result = await db.query.chapters.findFirst({
    where: eq(chapters.id, id),
    with: {
      flashcards: true,
    },
  });

  return result ?? null;
}

export async function createChapter(bookId: string, data: CreateChapterInput) {
  const [chapter] = await db
    .insert(chapters)
    .values({ ...data, bookId })
    .returning();

  return chapter;
}

export async function updateChapter(id: string, data: UpdateChapterInput) {
  const [chapter] = await db
    .update(chapters)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(chapters.id, id))
    .returning();

  return chapter ?? null;
}

export async function deleteChapter(id: string) {
  const [chapter] = await db.delete(chapters).where(eq(chapters.id, id)).returning();
  return chapter ?? null;
}
