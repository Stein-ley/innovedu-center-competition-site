# Knowledge Transfer Document

## 1. Project & Current Goal
- **Project**: Innovedu Center Competition Site.
- **Goal**: Phase 0 (Scaffold), Phase 1 (Local Git + Health Endpoint), and Phase 2 (Supabase schema, client & test route) completed. Ready for manual DB execution & secret setup, then Phase 3 (Auth & Exam CRUD).

## 2. Completed Work
- Scaffolding: package.json, tsconfig.json, wrangler.jsonc, README.md, .gitignore.
- Worker: src/index.ts, src/routes/health.ts, src/types/env.ts, public/index.html.
- Supabase layer (Phase 2):
  - `supabase/migrations/20261106_initial_schema.sql` (Tables: exams, questions, access_codes, attempts, answers + indexes & triggers).
  - `src/types/database.ts` (Full TypeScript interfaces and Supabase Generic Database Schema).
  - `src/services/supabase.ts` (Worker-compatible Supabase client factory).
  - `src/routes/test-db.ts` (`GET /api/organizer/test-db` endpoint to verify live DB connectivity).
- Docs: PRD.md, BUILD_PLAN.md.

## 3. Modified & Created Files
- `supabase/migrations/20261106_initial_schema.sql`
- `src/types/database.ts`
- `src/services/supabase.ts`
- `src/routes/test-db.ts`
- `src/index.ts`
- `knowledge-transfer.md`

## 4. Architecture & Key Decisions
- Stack: CF Workers (TS) + Supabase (Postgres) + Static Frontend.
- Secrets: Managed exclusively via `wrangler secret put` (no hardcoding).
- Git: Local only; user pushes manually to GitHub.

## 5. Current State & Known Issues
- All local code compiles cleanly (`npm run type-check`).
- Supabase SQL schema needs to be executed in the user's Supabase project dashboard.
- Worker secrets must be provisioned locally/remotely for test-db verification.

## 6. Immediate Next Steps (Manual Action for User)
1. Run `supabase/migrations/20261106_initial_schema.sql` in the Supabase SQL Editor.
2. Set Worker secrets via command line:
   - `npx wrangler secret put SUPABASE_URL`
   - `npx wrangler secret put SUPABASE_KEY`
   - `npx wrangler secret put SESSION_SECRET`
   - `npx wrangler secret put ADMIN_USERNAME`
   - `npx wrangler secret put ADMIN_PASSWORD`
3. (Optional for local dev) Create `.dev.vars` for local `wrangler dev` testing.
4. Test connectivity: Run `npx wrangler dev` and hit `GET /api/organizer/test-db`.
5. Proceed to Phase 3: Organizer Auth, Session Management & Exam CRUD.

## 7. Key Files to Read First
- PRD.md, BUILD_PLAN.md, src/index.ts, src/types/database.ts