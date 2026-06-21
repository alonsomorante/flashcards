import type { FastifyReply, FastifyRequest } from 'fastify';
import * as flashcardsService from '../services/flashcardsService';
import { createFlashcardSchema, updateFlashcardSchema } from '../validators/schemas';

export async function createFlashcard(
  request: FastifyRequest<{ Params: { chapterId: string } }>,
  reply: FastifyReply
) {
  const data = createFlashcardSchema.parse(request.body);
  const flashcard = await flashcardsService.createFlashcard(
    request.params.chapterId,
    data
  );

  return reply.status(201).send({ data: flashcard });
}

export async function updateFlashcard(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const data = updateFlashcardSchema.parse(request.body);
  const flashcard = await flashcardsService.updateFlashcard(
    request.params.id,
    data
  );

  if (!flashcard) {
    return reply.status(404).send({ error: 'Flashcard not found' });
  }

  return reply.send({ data: flashcard });
}

export async function deleteFlashcard(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const flashcard = await flashcardsService.deleteFlashcard(request.params.id);

  if (!flashcard) {
    return reply.status(404).send({ error: 'Flashcard not found' });
  }

  return reply.status(204).send();
}
