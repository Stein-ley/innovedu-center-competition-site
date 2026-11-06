-- Migration: 20261106_initial_schema.sql
-- Innovedu Center Competition Site: PostgreSQL Schema
-- Platform: Supabase

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Exams Table
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_name TEXT NOT NULL,
    event_title TEXT NOT NULL,
    exam_title TEXT NOT NULL,
    instructions TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Questions Table
CREATE TABLE IF NOT EXISTS questions (
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Access Codes Table
CREATE TABLE IF NOT EXISTS access_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    is_used BOOLEAN NOT NULL DEFAULT false,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Exam Attempts Table
CREATE TABLE IF NOT EXISTS attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    access_code_id UUID NOT NULL UNIQUE REFERENCES access_codes(id) ON DELETE RESTRICT,
    participant_name TEXT NOT NULL,
    participant_email TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    is_submitted BOOLEAN NOT NULL DEFAULT false,
    total_score NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    is_graded BOOLEAN NOT NULL DEFAULT false
);

-- 5. Answers Table
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id TEXT, -- For MCQ
    written_text TEXT, -- For written questions
    score_awarded NUMERIC(5,2),
    feedback TEXT,
    graded_at TIMESTAMPTZ,
    CONSTRAINT unique_attempt_question UNIQUE (attempt_id, question_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_questions_exam_order ON questions(exam_id, question_order);
CREATE INDEX IF NOT EXISTS idx_access_codes_exam_id ON access_codes(exam_id);
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);
CREATE INDEX IF NOT EXISTS idx_attempts_exam_id ON attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_attempts_access_code_id ON attempts(access_code_id);
CREATE INDEX IF NOT EXISTS idx_answers_attempt_id ON answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);

-- Automatic trigger for updated_at on exams
CREATE OR REPLACE FUNCTION update_exams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_exams_updated_at ON exams;
CREATE TRIGGER trigger_exams_updated_at
BEFORE UPDATE ON exams
FOR EACH ROW
EXECUTE FUNCTION update_exams_updated_at();
