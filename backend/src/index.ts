import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { ZodError } from 'zod';
import { registerRoutes } from './routes';
import { pool } from './db';

const app = Fastify({
  logger: true,
});

// CORS
await app.register(cors, {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// Error handler
app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'Validation error',
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (error.statusCode) {
    return reply.status(error.statusCode).send({ error: error.message });
  }

  app.log.error(error);
  return reply.status(500).send({ error: 'Internal server error' });
});

// Health check
app.get('/health', async () => ({ status: 'ok' }));

// Register routes
app.register(registerRoutes, { prefix: '/api' });

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(`Server running on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
async function shutdown(signal: string) {
  app.log.info(`Received ${signal}, shutting down gracefully...`);
  try {
    await app.close();
    await pool.end();
    app.log.info('Server and database pool closed');
    process.exit(0);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
