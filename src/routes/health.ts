import type { Env } from '../types/env';

export async function handleHealth(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  return new Response(JSON.stringify({ ok: true, service: 'Innovedu Center Competition site API' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}