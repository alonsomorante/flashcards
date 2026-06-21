import type { FastifyReply, FastifyRequest } from 'fastify';
import * as booksService from '../services/booksService';
import { createBookSchema, updateBookSchema } from '../validators/schemas';

export async function getBooks(_request: FastifyRequest, reply: FastifyReply) {
  const books = await booksService.getAllBooks();
  return reply.send({ data: books });
}

export async function getBook(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const book = await booksService.getBookById(request.params.id);

  if (!book) {
    return reply.status(404).send({ error: 'Book not found' });
  }

  return reply.send({ data: book });
}

export async function createBook(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const data = createBookSchema.parse(request.body);
  const book = await booksService.createBook(data);
  return reply.status(201).send({ data: book });
}

export async function updateBook(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const data = updateBookSchema.parse(request.body);
  const book = await booksService.updateBook(request.params.id, data);

  if (!book) {
    return reply.status(404).send({ error: 'Book not found' });
  }

  return reply.send({ data: book });
}

export async function deleteBook(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const book = await booksService.deleteBook(request.params.id);

  if (!book) {
    return reply.status(404).send({ error: 'Book not found' });
  }

  return reply.status(204).send();
}
