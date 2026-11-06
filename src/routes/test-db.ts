import type { Env } from '../types/env';
import { createSupabaseClient } from '../services/supabase';

/**
 * Route handler: GET /api/organizer/test-db
 * Verifies live Supabase PostgreSQL connectivity by attempting a lightweight query against the exams table.
 */
export async function handleTestDb(request: Request, env: Env): Promise<Response> {
  const startTime = Date.now();

  if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'SUPABASE_URL or SUPABASE_KEY is missing from environment. Set them via wrangler secret put.'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const supabase = createSupabaseClient(env);
    const { count, error } = await supabase
      .from('exams')
      .select('*', { count: 'exact', head: true })
      .abortSignal(AbortSignal.timeout(8000));

    const latencyMs = Date.now() - startTime;

    if (error) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          latencyMs
        }),
        {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Successfully connected to Supabase PostgreSQL database',
        table: 'exams',
        recordCount: count ?? 0,
        latencyMs
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({
        ok: false,
        error: errorMessage,
        latencyMs
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
