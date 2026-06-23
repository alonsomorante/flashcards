import type { FastifyInstance } from 'fastify';
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} from '../controllers/booksController';
import {
  getChapter,
  createChapter,
  updateChapter,
  deleteChapter,
} from '../controllers/chaptersController';
import {
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
} from '../controllers/flashcardsController';
import {
  getChapterStudy,
  getBookStudy,
  reviewFlashcard,
} from '../controllers/studyController';
import { spellCheck } from '../controllers/spellCheckController';

export async function registerRoutes(app: FastifyInstance) {
  // Books
  app.get('/books', getBooks);
  app.get('/books/:id', getBook);
  app.post('/books', createBook);
  app.put('/books/:id', updateBook);
  app.delete('/books/:id', deleteBook);

  // Chapters
  app.get('/chapters/:id', getChapter);
  app.post('/books/:bookId/chapters', createChapter);
  app.put('/chapters/:id', updateChapter);
  app.delete('/chapters/:id', deleteChapter);

  // Flashcards
  app.post('/chapters/:chapterId/flashcards', createFlashcard);
  app.put('/flashcards/:id', updateFlashcard);
  app.delete('/flashcards/:id', deleteFlashcard);

  // Study
  app.get('/chapters/:id/study', getChapterStudy);
  app.get('/books/:id/study', getBookStudy);
  app.post('/flashcards/:id/review', reviewFlashcard);

  // AI
  app.post('/spell-check', spellCheck);
}
