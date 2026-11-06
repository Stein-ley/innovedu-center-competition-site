import { Router } from 'itty-router';
import { handleHealth } from './routes/health';
import type { Env } from './types/env';

const router = Router();

router.get('/api/health', handleHealth);

router.all('*', async (request: Request, env: Env) => {
  return env.ASSETS.fetch(request);
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router.handle(request, env, ctx);
  }
};