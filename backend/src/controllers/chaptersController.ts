import type { FastifyReply, FastifyRequest } from 'fastify';
import * as chaptersService from '../services/chaptersService';
import { createChapterSchema, updateChapterSchema } from '../validators/schemas';

export async function getChapter(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const chapter = await chaptersService.getChapterById(request.params.id);

  if (!chapter) {
    return reply.status(404).send({ error: 'Chapter not found' });
  }

  return reply.send({ data: chapter });
}

export async function createChapter(
  request: FastifyRequest<{ Params: { bookId: string } }>,
  reply: FastifyReply
) {
  const data = createChapterSchema.parse(request.body);
  const chapter = await chaptersService.createChapter(
    request.params.bookId,
    data
  );

  return reply.status(201).send({ data: chapter });
}

export async function updateChapter(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const data = updateChapterSchema.parse(request.body);
  const chapter = await chaptersService.updateChapter(
    request.params.id,
    data
  );

  if (!chapter) {
    return reply.status(404).send({ error: 'Chapter not found' });
  }

  return reply.send({ data: chapter });
}

export async function deleteChapter(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const chapter = await chaptersService.deleteChapter(request.params.id);

  if (!chapter) {
    return reply.status(404).send({ error: 'Chapter not found' });
  }

  return reply.status(204).send();
}
