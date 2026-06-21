import { eq, inArray } from 'drizzle-orm';
import { db } from '../db';
import { chapters, flashcards } from '../db/schema';
import type { Flashcard } from '../db/schema';

const DECAY_DAYS = 3;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function calculateEffectiveLevel(card: Flashcard): number {
  if (card.lastReviewedAt === null) {
    return 0;
  }

  const daysSinceReview =
    (Date.now() - new Date(card.lastReviewedAt).getTime()) / MS_PER_DAY;

  if (daysSinceReview > DECAY_DAYS) {
    return Math.max(card.level - 1, 0);
  }

  return card.level;
}

export async function getChapterStudyCards(chapterId: string) {
  const chapter = await db.query.chapters.findFirst({
    where: eq(chapters.id, chapterId),
  });

  if (!chapter) {
    return null;
  }

  const cards = await db.select().from(flashcards).where(eq(flashcards.chapterId, chapterId));

  const sortedCards = cards
    .map((card) => ({
      ...card,
      effectiveLevel: calculateEffectiveLevel(card),
    }))
    .sort((a, b) => {
      if (a.effectiveLevel !== b.effectiveLevel) {
        return a.effectiveLevel - b.effectiveLevel;
      }

      if (a.lastReviewedAt === null && b.lastReviewedAt === null) {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      if (a.lastReviewedAt === null) return -1;
      if (b.lastReviewedAt === null) return 1;

      return (
        new Date(a.lastReviewedAt).getTime() - new Date(b.lastReviewedAt).getTime()
      );
    });

  return sortedCards;
}

export async function getBookStudyCards(bookId: string) {
  const bookChapters = await db.query.chapters.findMany({
    where: eq(chapters.bookId, bookId),
    columns: { id: true },
  });

  if (bookChapters.length === 0) {
    return [];
  }

  const chapterIds = bookChapters.map((chapter) => chapter.id);
  const cards = await db
    .select()
    .from(flashcards)
    .where(inArray(flashcards.chapterId, chapterIds));

  return shuffle(cards);
}

export async function reviewFlashcard(id: string, level: number) {
  const [flashcard] = await db
    .update(flashcards)
    .set({
      level,
      lastReviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(flashcards.id, id))
    .returning();

  return flashcard ?? null;
}
