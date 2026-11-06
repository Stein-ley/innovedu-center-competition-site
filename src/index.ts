import { Router } from 'itty-router';
import { handleHealth } from './routes/health';
import { handleTestDb } from './routes/test-db';
import type { Env } from './types/env';

const router = Router();

router.get('/api/health', handleHealth);
router.get('/api/organizer/test-db', handleTestDb);

router.all('*', async (request: Request, env: Env) => {
  if (env.ASSETS) {
    return env.ASSETS.fetch(request);
  }
  return new Response('Not Found', { status: 404 });
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const response = await router.fetch(request, env, ctx);
      if (response instanceof Response) {
        return response;
      }
      if (env.ASSETS) {
        return await env.ASSETS.fetch(request);
      }
      return new Response('Not Found', { status: 404 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return new Response(JSON.stringify({ ok: false, error: message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};