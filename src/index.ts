import { Router } from 'itty-router';
import { handleHealth } from './routes/health';
import { handleTestDb } from './routes/test-db';
import type { Env } from './types/env';

const router = Router();

router.get('/api/health', handleHealth);
router.get('/api/organizer/test-db', handleTestDb);

router.all('*', async (request: Request, env: Env) => {
  return env.ASSETS.fetch(request);
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router.handle(request, env, ctx);
  }
};