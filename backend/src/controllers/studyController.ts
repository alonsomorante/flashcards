import type { FastifyReply, FastifyRequest } from 'fastify';
import * as studyService from '../services/studyService';
import { reviewFlashcardSchema } from '../validators/schemas';

export async function getChapterStudy(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const cards = await studyService.getChapterStudyCards(request.params.id);

  if (cards === null) {
    return reply.status(404).send({ error: 'Chapter not found' });
  }

  return reply.send({ data: cards });
}

export async function getBookStudy(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const cards = await studyService.getBookStudyCards(request.params.id);
  return reply.send({ data: cards });
}

export async function reviewFlashcard(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const data = reviewFlashcardSchema.parse(request.body);
  const flashcard = await studyService.reviewFlashcard(
    request.params.id,
    data.level
  );

  if (!flashcard) {
    return reply.status(404).send({ error: 'Flashcard not found' });
  }

  return reply.send({ data: flashcard });
}
