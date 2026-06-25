import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import * as ttsService from '../services/ttsService';

const ttsRequestSchema = z.object({
  text: z.string().trim().min(1).max(1000),
  language: z.string().trim().min(2).max(10).default('es-ES'),
});

export async function textToSpeech(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { text, language } = ttsRequestSchema.parse(request.body);

  try {
    const audio = await ttsService.synthesizeSpeech(text, language);

    return reply
      .status(200)
      .header('Content-Type', 'audio/mpeg')
      .header('Cache-Control', 'private, max-age=86400')
      .send(audio);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'TTS failed';
    return reply.status(500).send({ error: message });
  }
}
