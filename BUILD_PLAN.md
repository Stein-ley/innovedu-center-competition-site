
# BUILD PLAN: Innovedu Center Competition Site

This document outlines the ordered development phases, dependencies, file creation steps, commands, and live verification milestones required to build and deploy the Innovedu Center Competition platform from scratch.

---

## Phase 0: Repository & Project Scaffolding
- **Dependencies**: None.
- **Files to Create**:
  - `package.json` (Dependencies: `@supabase/supabase-js`, `itty-router` or lightweight Worker router, `wrangler`, `typescript`, `@cloudflare/workers-types`).
  - `tsconfig.json` (Target ES2022, module resolution Bundler / NodeNext for Workers).
  - `wrangler.jsonc` (Worker name, main entry point `src/index.ts`, asset binding `assets: { directory: "./public" }`).
  - `README.md` (Project summary and dev instructions).
  - Folder structure: `src/`, `src/routes/`, `src/services/`, `public/`, `public/js/`, `public/css/`, `supabase/migrations/`.
  - `.gitignore` (node_modules, .wrangler, local env files).
- **Commands to Run**:
  - `npm install`
- **Verification Step**: Run `npx wrangler dev --dry-run` or local TypeScript check `npx tsc --noEmit` to verify configuration syntax without errors.

---

## Phase 1: GitHub Wiring & Cloudflare Workers Build Baseline
- **Dependencies**: GitHub repository created by user, Cloudflare Worker linked to repo.
- **Files to Create / Update**:
  - `src/index.ts` (API router handling `/api/health`, routing unknown routes to `env.ASSETS.fetch`).
  - `public/index.html` (Baseline placeholder landing page).
- **Commands to Run**:
  - `git init`, `git add .`, `git commit -m "chore: phase 1 scaffold and health endpoint"`
  - Push commit to GitHub primary branch (`main`).
- **Verification Step**: Access deployed URL:
  - `GET /api/health` -> Returns `{"ok": true, "service": "Innovedu Center Competition site API"}`
  - `GET /` -> Serves placeholder HTML from `./public`.

---

## Phase 2: Supabase Infrastructure, Database Schema & Database Layer
- **Dependencies**: Supabase project created; credentials set in Worker environment via `wrangler secret put`.
- **Files to Create**:
  - `supabase/migrations/20261106_initial_schema.sql` (Tables: `exams`, `questions`, `access_codes`, `attempts`, `answers`).
  - `src/services/supabase.ts` (Supabase client factory initialized with Worker environment secrets `SUPABASE_URL` and `SUPABASE_KEY`).
  - `src/types/database.ts` (TypeScript interfaces matching SQL schema).
- **Commands to Run**:
  - Execute schema SQL in Supabase SQL Editor.
  - Set Worker secrets via `wrangler secret put` (`SUPABASE_URL`, `SUPABASE_KEY`, `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`).
- **Verification Step**: Worker endpoint `GET /api/organizer/test-db` calls Supabase client to fetch table count and verifies valid connectivity without authentication failures.

---

## Phase 3: Organizer Auth, Session Management & Exam CRUD
- **Dependencies**: Phase 2 completion.
- **Files to Create**:
  - `src/services/auth.ts` (Password verification & session token HMAC cookie signing).
  - `src/routes/auth.ts` (`POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`).
  - `src/routes/exams.ts` (CRUD: `GET /api/exams`, `POST /api/exams`, `GET /api/exams/:id`, `PUT /api/exams/:id`, `DELETE /api/exams/:id`, `POST /api/exams/import`, `GET /api/exams/:id/export`).
  - `public/organizer-login.html` & `public/js/organizer-login.js`.
  - `public/organizer-dashboard.html` & `public/js/organizer-dashboard.js`.
- **Verification Step**:
  1. Log into `/organizer-login.html` with valid credentials -> sets HTTP session cookie.
  2. Create an exam using the default template.
  3. Export created exam to JSON, delete it, re-import JSON -> verify exam restored independently without affecting existing exams.

---

## Phase 4: Question Management & Audio Attachment Workflow
- **Dependencies**: Phase 3 completion, Supabase Storage bucket created (`competition-audio`).
- **Files to Create**:
  - `src/routes/questions.ts` (CRUD operations for questions, order reindexing).
  - `src/routes/storage.ts` (`POST /api/storage/upload-audio` - signed upload handling for Supabase Storage).
  - `public/js/question-editor.js` (UI component for adding/editing MCQs, written questions, images, and audio player previews).
- **Verification Step**: Upload audio track MP3/WAV to a question, save exam, verify audio preview plays directly in organizer question editor.

---

## Phase 5: Participant Flow & Timed Exam Engine
- **Dependencies**: Phase 4 completion.
- **Files to Create**:
  - `src/routes/participant.ts` (Validate access code: `POST /api/participant/verify-code`, Start exam: `POST /api/participant/start`, Submit attempt: `POST /api/participant/submit`).
  - `public/participant.html` (Multi-stage SPA: Access Code Entry -> Information Form & Rules Acceptance -> Timed Question Interface -> Finish Confirmation Page).
  - `public/js/participant.js` (Client-side countdown timer, question pagination, auto-save state, submit handler).
- **Verification Step**:
  1. Enter valid access code on participant page -> fill candidate details -> accept rules -> complete test questions.
  2. Confirm submission -> Finish page renders **WITHOUT displaying the score**.
  3. Re-enter same access code -> system rejects with "Access Code Already Used" message.

---

## Phase 6: Grading Engine & Results Review/Export
- **Dependencies**: Phase 5 completion.
- **Files to Create**:
  - `src/routes/grading.ts` (`GET /api/organizer/exams/:id/attempts`, `GET /api/organizer/attempts/:id`, `POST /api/organizer/attempts/:id/grade`, `GET /api/organizer/exams/:id/export-results`).
  - `public/organizer-results.html` & `public/js/organizer-results.js` (Results table, written answer grading modal, CSV/JSON export trigger).
- **Verification Step**:
  1. Submit attempt containing MCQs and written questions.
  2. Verify MCQ auto-graded score in dashboard.
  3. Grade written question manually via modal, assign partial points -> total updated.
  4. Export CSV results file and verify accurate student breakdown.

---

## Phase 7: Embed-HTML Generator & Output Sanitization
- **Dependencies**: Phase 5 completion.
- **Files to Create**:
  - `src/routes/embed.ts` or client-side helper in `public/js/organizer-dashboard.js`.
  - Embed Modal component in `public/organizer-dashboard.html`.
- **Verification Step**: Click "Generate Embed Code" on an exam -> paste generated `<iframe>` snippet into external test HTML file -> opens participant screen seamlessly without hosting branding or attribution.

---

## Phase 8: End-to-End System Checklist & Launch Validation
- **Dependencies**: All prior phases complete.
- **Verification Steps**:
  1. Complete organizer login, exam creation, audio upload, and code generation.
  2. Test participant exam flow in an isolated incognito browser window.
  3. Confirm graceful error UI handling when network is toggled offline.
  4. Confirm zero secret leaks in client responses.
