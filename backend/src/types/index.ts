import type { Book, Chapter, Flashcard } from '../db/schema';

export type BookWithChapters = Book & {
  chapters: Chapter[];
};

export type ChapterWithFlashcards = Chapter & {
  flashcards: Flashcard[];
};

export type StudyCard = Flashcard & {
  effectiveLevel: number;
};
