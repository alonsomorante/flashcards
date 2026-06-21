import type {
  Book,
  BookWithChapters,
  Chapter,
  ChapterWithFlashcards,
  Flashcard,
  StudyCard,
  ReviewLevel,
} from '../types/index';

const BASE_URL = import.meta.env.VITE_API_URL;

interface ApiError {
  error: string;
  message?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  if (options?.body) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as ApiError;
      message = body.error || body.message || message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

interface ApiResponse<T> {
  data: T;
}

export const api = {
  // Books
  getBooks: () => request<ApiResponse<Book[]>>(`/books`).then((r) => r.data),
  getBook: (id: string) =>
    request<ApiResponse<BookWithChapters>>(`/books/${id}`).then((r) => r.data),
  createBook: (title: string) =>
    request<ApiResponse<Book>>(`/books`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    }).then((r) => r.data),
  updateBook: (id: string, title: string) =>
    request<ApiResponse<Book>>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    }).then((r) => r.data),
  deleteBook: (id: string) => request<void>(`/books/${id}`, { method: 'DELETE' }),

  // Chapters
  getChapter: (id: string) =>
    request<ApiResponse<ChapterWithFlashcards>>(`/chapters/${id}`).then((r) => r.data),
  createChapter: (bookId: string, title: string) =>
    request<ApiResponse<Chapter>>(`/books/${bookId}/chapters`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    }).then((r) => r.data),
  updateChapter: (id: string, title: string) =>
    request<ApiResponse<Chapter>>(`/chapters/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    }).then((r) => r.data),
  deleteChapter: (id: string) =>
    request<void>(`/chapters/${id}`, { method: 'DELETE' }),

  // Flashcards
  createFlashcard: (chapterId: string, front: string, back: string) =>
    request<ApiResponse<Flashcard>>(`/chapters/${chapterId}/flashcards`, {
      method: 'POST',
      body: JSON.stringify({ front, back }),
    }).then((r) => r.data),
  updateFlashcard: (id: string, data: { front?: string; back?: string }) =>
    request<ApiResponse<Flashcard>>(`/flashcards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then((r) => r.data),
  deleteFlashcard: (id: string) =>
    request<void>(`/flashcards/${id}`, { method: 'DELETE' }),

  // Study
  getChapterStudy: (id: string) =>
    request<ApiResponse<StudyCard[]>>(`/chapters/${id}/study`).then((r) => r.data),
  getBookStudy: (id: string) =>
    request<ApiResponse<Flashcard[]>>(`/books/${id}/study`).then((r) => r.data),
  reviewFlashcard: (id: string, level: ReviewLevel) =>
    request<ApiResponse<Flashcard>>(`/flashcards/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ level }),
    }).then((r) => r.data),
};

export type {
  Book,
  BookWithChapters,
  Chapter,
  ChapterWithFlashcards,
  Flashcard,
  StudyCard,
  ReviewLevel,
};
