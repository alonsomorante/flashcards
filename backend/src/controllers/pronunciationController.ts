import type { FastifyReply, FastifyRequest } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { flashcards } from '../db/schema';
import { generatePronunciation } from '../services/pronunciationService';

// El español no necesita guía de pronunciación: el usuario ya es hispanohablante
function isSpanish(language: string): boolean {
  return language.toLowerCase().startsWith('es');
}

export async function generateFlashcardPronunciation(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const [card] = await db
    .select()
    .from(flashcards)
    .where(eq(flashcards.id, request.params.id));

  if (!card) {
    return reply.status(404).send({ error: 'Flashcard not found' });
  }

  try {
    const updates: { frontPronunciation?: string; backPronunciation?: string } = {};

    if (!isSpanish(card.frontLanguage)) {
      updates.frontPronunciation = await generatePronunciation(card.front, card.frontLanguage);
    }
    if (!isSpanish(card.backLanguage)) {
      updates.backPronunciation = await generatePronunciation(card.back, card.backLanguage);
    }

    if (Object.keys(updates).length === 0) {
      return reply
        .status(400)
        .send({ error: 'La flashcard no tiene ningún lado en otro idioma' });
    }

    const [updated] = await db
      .update(flashcards)
      .set(updates)
      .where(eq(flashcards.id, card.id))
      .returning();

    return reply.send({ data: updated });
  } catch (error) {
    request.log.error(error);
    return reply.status(502).send({ error: 'No se pudo generar la pronunciación' });
  }
}
