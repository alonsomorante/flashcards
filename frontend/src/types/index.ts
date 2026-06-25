export interface Book {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookWithChapters extends Book {
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChapterWithFlashcards extends Chapter {
  flashcards: Flashcard[];
}

export interface Flashcard {
  id: string;
  chapterId: string;
  front: string;
  back: string;
  frontLanguage: string;
  backLanguage: string;
  level: number;
  lastReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudyCard extends Flashcard {
  effectiveLevel: number;
}

export type ReviewLevel = 0 | 1 | 2 | 3;

export const LEVEL_LABELS: Record<ReviewLevel, string> = {
  0: 'No la sé',
  1: 'Me costó',
  2: 'Recordé',
  3: 'Dominada',
};

export const LEVEL_COLORS: Record<ReviewLevel, string> = {
  0: 'bg-red-100 text-red-800',
  1: 'bg-orange-100 text-orange-800',
  2: 'bg-yellow-100 text-yellow-800',
  3: 'bg-green-100 text-green-800',
};
