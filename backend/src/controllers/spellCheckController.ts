import type { FastifyReply, FastifyRequest } from 'fastify';
import { correctText } from '../services/spellCheckService';

interface SpellCheckBody {
  text: string;
}

interface SpellCheckResponse {
  corrected: string;
}

export async function spellCheck(
  request: FastifyRequest<{ Body: SpellCheckBody }>,
  reply: FastifyReply
): Promise<SpellCheckResponse> {
  const { text } = request.body;

  if (typeof text !== 'string' || text.trim().length === 0) {
    return reply.status(400).send({ error: 'El campo text es obligatorio' });
  }

  try {
    const corrected = await correctText(text);
    return reply.send({ data: { corrected } });
  } catch (error) {
    request.log.error(error);
    return reply.status(502).send({ error: 'No se pudo corregir el texto' });
  }
}
