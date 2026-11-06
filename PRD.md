# Product Requirement Document (PRD) - Innovedu Center Competition Site

## 1. Overview & Purpose
The **Innovedu Center Competition site** is a desktop-first web platform engineered to host online assessments, competitions, and examinations for 50 to 200 concurrent participants. Organizers create, configure, and manage multiple independent exams, while participants join via individual access codes to complete timed assessments.

---

## 2. Target Users
- **Organizer / Admin**: Administrators who log in to set up competition parameters, manage exams, upload media/audio attachments, monitor submissions, perform manual grading for written answers, export results, and generate embeddable HTML iframe snippets.
- **Participant / Student**: Students or contest entrants who navigate to individual exam links, authenticate via unique access codes, review competition rules, provide identity details, complete timed tests, and view finish confirmation pages without seeing immediate scores.

---

## 3. Architecture

### Architecture Diagram
`
+-----------------------------------------------------------------------+
|                             Client Browser                            |
|  +-------------------------------+     +---------------------------+  |
|  | Organizer Dashboard UI        |     | Participant Exam UI       |  |
|  | (HTML/CSS/JS in ./public)     |     | (HTML/CSS/JS in ./public) |  |
|  +---------------+---------------+     +-------------+-------------+  |
+------------------|-----------------------------------|----------------+
                   | REST API Requests (/api/*)        |
                   v                                   v
+-----------------------------------------------------------------------+
|               Cloudflare Workers API Gateway & Runtime                |
|  - Request Routing & Validation                                       |
|  - Admin Auth Session Verification (HMAC-SHA256 Token)                |
|  - Fallback non-API requests to static asset binding (env.ASSETS)      |
+----------------------------------+------------------------------------+
                                   |
                                   | Supabase JS SDK (@supabase/supabase-js)
                                   v
+-----------------------------------------------------------------------+
|                           Supabase Platform                           |
|  +--------------------------------+  +-----------------------------+  |
|  | PostgreSQL Database            |  | Supabase Storage            |  |
|  | (Exams, Questions, Access      |  | (Audio attachments & images |  |
|  |  Codes, Attempts, Grades)      |  |  public/signed media URL)   |  |
|  +--------------------------------+  +-----------------------------+  |
+-----------------------------------------------------------------------+
`


### Chosen Tech Stack & Rationale
- **Runtime & API Framework**: **TypeScript** on **Cloudflare Workers**. TypeScript provides strict static typing for complex payload validation (JSON import/export schema, exam questions structure, and submission payloads) while leveraging Cloudflare's ultra-low latency edge compute.
- **Database & Storage**: **Supabase (PostgreSQL)** via `@supabase/supabase-js` and **Supabase Storage**. Postgres offers relational integrity (foreign keys between exams, access codes, and attempts), while Supabase Storage natively handles audio files and image upload assets with CDN delivery.
- **Frontend**: Native HTML5, CSS3, and modern vanilla JavaScript served directly by Cloudflare Workers static asset binding (`env.ASSETS.fetch`). Eliminates complex frontend bundlers while ensuring light bundle weight and instant initial page loads.
- **Deployment Pipeline**: **Cloudflare Workers Builds** connected directly to the **GitHub Repository**. Provides continuous automated deployments upon pushing commits without relying on local manual deployments.
- **Secrets Management**: Runtime variables bound exclusively via `wrangler secret put` (`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `SUPABASE_URL`, `SUPABASE_KEY`).

---

## 4. Functional Requirements & Acceptance Criteria

### Area A: Organizer Authentication & Session Management
- **Req A.1**: Login screen for organizer with username & password.
  - *Acceptance Criteria*: Submitting matching `ADMIN_USERNAME` and `ADMIN_PASSWORD` returns an encrypted HTTP-only session token signed with `SESSION_SECRET`. Unauthenticated requests to `/api/organizer/*` return HTTP 401.
- **Req A.2**: Dashboard navigation and logout.
  - *Acceptance Criteria*: Organizer can log out, invalidating local session cookies. Dashboard redirects to `/login` if unauthenticated.

### Area B: Exam Management (CRUD & JSON Import/Export)
- **Req B.1**: Independent multi-exam hosting.
  - *Acceptance Criteria*: Creating, editing, or deleting one exam does not alter, interrupt, or affect any other exam.
- **Req B.2**: Field separation.
  - *Acceptance Criteria*: Schema and forms maintain explicit separate fields for `organizer_name` (e.g., "Innovedu Academic Board"), `event_title` (e.g., "National STEM Challenge 2026"), and `exam_title` (e.g., "Round 1: Advanced Physics").
- **Req B.3**: Default template starting point.
  - *Acceptance Criteria*: Creating a new exam pre-fills a usable blank/default structure with baseline metadata and sample questions.
- **Req B.4**: JSON Import and Export.
  - *Acceptance Criteria*: Exporting an exam generates a formatted JSON document containing exam metadata and question lists. Importing a valid JSON payload creates a new distinct exam record.

### Area C: Question Management & Audio/Image Attachments
- **Req C.1**: Question types support.
  - *Acceptance Criteria*: Supports Multiple Choice Questions (MCQ) with predefined correct option keys and Written Answer questions requiring manual text scoring.
- **Req C.2**: Media attachments.
  - *Acceptance Criteria*: Image URLs can be attached to any question. Audio files (e.g., MP3/WAV for English listening components) are uploaded to Supabase Storage and rendered in participant UI with standard HTML audio controls.

### Area D: Access Code & Participant Verification
- **Req D.1**: Individual access code generation and assignment.
  - *Acceptance Criteria*: Organizer can generate or batch-create unique string codes tied to specific exams.
- **Req D.2**: One-attempt enforcement.
  - *Acceptance Criteria*: Access codes can be used exactly once. Re-entering a used code displays an informative error screen blocking exam entry.
- **Req D.3**: Pre-exam information capture & rules acknowledgment.
  - *Acceptance Criteria*: Prior to opening test questions, participant must enter required details (Full Name, Email/ID) and check a required consent/rules checkbox.

### Area E: Timed Exam Experience & Submission
- **Req E.1**: Client & server timed assessment.
  - *Acceptance Criteria*: Client displays a countdown timer. When time expires, test auto-submits current answers. Server rejects submissions received after elapsed exam duration + 60s grace buffer.
- **Req E.2**: Submit & Finish confirmation screen.
  - *Acceptance Criteria*: Successful submission routes to a finish confirmation page. **The participant score MUST NOT be displayed** on this page.

### Area F: Grading, Results Review & Export
- **Req F.1**: Automated MCQ & Manual Written Grading.
  - *Acceptance Criteria*: MCQ answers are automatically evaluated upon submission. Organizer dashboard provides an interface to review written answers, assign partial/full scores, and record feedback.
- **Req F.2**: Results Export.
  - *Acceptance Criteria*: Organizer can export participant results, metadata, timestamps, individual scores, and final totals as CSV or JSON.

### Area G: Embed-HTML Generator
- **Req G.1**: Iframe snippet generation with sanitization.
  - *Acceptance Criteria*: Provides a modal/button generating a clean HTML `<iframe>` snippet pointing to the participant exam URL. The code must be completely white-labeled without branding or attribution to the internal hosting URL, sanitized against XSS attacks.

---

## 5. Non-Functional Requirements
- **Security**: Secrets stored in Cloudflare Worker environment. Session tokens signed via HMAC-SHA256 using `SESSION_SECRET`. Inputs sanitized against SQL injection and XSS.
- **Data Privacy**: Participant names and details stored in Supabase with restricted API access endpoints accessible only via authenticated admin sessions or valid access code validation.
- **Performance**: Capable of handling 50–200 concurrent participant submissions without API latency exceeding 500ms.
- **Desktop-First UX**: Responsive, clean layout optimized for 1024px+ screen widths, with mobile fallback.
- **Graceful degradation**: Frontend components render explicit error containers with retry buttons when API endpoints fail (no infinite loading spinners).

---

## 6. Supabase Database Schema Outline

```sql
-- 1. Exams Table
TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_name TEXT NOT NULL,
    event_title TEXT NOT NULL,
    exam_title TEXT NOT NULL,
    instructions TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Questions Table
TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'written')),
    prompt_text TEXT NOT NULL,
    image_url TEXT,
    audio_url TEXT,
    options JSONB, -- For MCQ: [{"id": "a", "text": "Option A"}, ...]
    correct_option_id TEXT, -- For MCQ auto-grading
    max_score NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Access Codes Table
TABLE access_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    is_used BOOLEAN NOT NULL DEFAULT false,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Exam Attempts Table
TABLE attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    access_code_id UUID NOT NULL UNIQUE REFERENCES access_codes(id),
    participant_name TEXT NOT NULL,
    participant_email TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    is_submitted BOOLEAN NOT NULL DEFAULT false,
    total_score NUMERIC(5,2) DEFAULT 0.00,
    is_graded BOOLEAN NOT NULL DEFAULT false
);

-- 5. Answers Table
TABLE answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id TEXT, -- For MCQ
    written_text TEXT, -- For written questions
    score_awarded NUMERIC(5,2),
    feedback TEXT,
    graded_at TIMESTAMPTZ
);
