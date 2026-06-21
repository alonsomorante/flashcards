import { eq } from 'drizzle-orm';
import { db } from '../db';
import { books } from '../db/schema';
import type { CreateBookInput, UpdateBookInput } from '../validators/schemas';

export async function getAllBooks() {
  return db.select().from(books).orderBy(books.createdAt);
}

export async function getBookById(id: string) {
  const result = await db.query.books.findFirst({
    where: eq(books.id, id),
    with: {
      chapters: true,
    },
  });

  return result ?? null;
}

export async function createBook(data: CreateBookInput) {
  const [book] = await db.insert(books).values(data).returning();
  return book;
}

export async function updateBook(id: string, data: UpdateBookInput) {
  const [book] = await db
    .update(books)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(books.id, id))
    .returning();

  return book ?? null;
}

export async function deleteBook(id: string) {
  const [book] = await db.delete(books).where(eq(books.id, id)).returning();
  return book ?? null;
}
