import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Env } from '../types/env';
import type { Database } from '../types/database';

/**
 * Creates an instance of the Supabase client typed to our database schema.
 * Configured specifically for Cloudflare Workers (persistSession disabled).
 */
export function createSupabaseClient(env: Env): SupabaseClient<Database> {
  if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_KEY in environment secrets.');
  }

  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}
